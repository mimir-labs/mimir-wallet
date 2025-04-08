// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useSelectedAccount } from '@/accounts/useSelectedAccount';
import ArrowDown from '@/assets/svg/ArrowDown.svg?react';
import { useQueryParam } from '@/hooks/useQueryParams';
import { useMultiChainTransactionCounts } from '@/hooks/useTransactions';
import { useLayoutEffect, useMemo, useState } from 'react';
import { useToggle } from 'react-use';

import { type Endpoint, useApi } from '@mimir-wallet/polkadot-core';
import {
  Avatar,
  Button,
  Checkbox,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  Listbox,
  ListboxItem,
  Tab,
  Tabs
} from '@mimir-wallet/ui';

import HistoryTransactions from './HistoryTransactions';
import PendingTransactions from './PendingTransactions';

function Content({ address }: { address: string }) {
  const { allApis } = useApi();
  const [transactionCounts] = useMultiChainTransactionCounts(address);
  const [validPendingNetworks, validHistoryNetworks] = useMemo(() => {
    const validPendingNetworks: { network: string; counts: number; chain: Endpoint }[] = [];
    const validHistoryNetworks: { network: string; counts: number; chain: Endpoint }[] = [];

    Object.entries(transactionCounts || {}).forEach(([network, counts]) => {
      if (counts.pending > 0 && allApis[network]?.chain) {
        validPendingNetworks.push({
          network,
          counts: counts.pending,
          chain: allApis[network]?.chain
        });
      }

      if (counts.history > 0 && allApis[network]?.chain) {
        validHistoryNetworks.push({
          network,
          counts: counts.history,
          chain: allApis[network]?.chain
        });
      }
    });

    return [
      validPendingNetworks.sort((a, b) => b.counts - a.counts),
      validHistoryNetworks.sort((a, b) => b.counts - a.counts)
    ];
  }, [allApis, transactionCounts]);
  const [isOpen, toggleOpen] = useToggle(false);
  const [selectedPendingNetworks, setSelectedPendingNetworks] = useState<string[]>([]);
  const [selectedHistoryNetworks, setSelectedHistoryNetworks] = useState<string[]>([]);

  const [type, setType] = useQueryParam<string>('status', 'pending');
  const [txId] = useQueryParam<string>('tx_id');

  useLayoutEffect(() => {
    if (selectedPendingNetworks.length === 0 && validPendingNetworks.length > 0) {
      setSelectedPendingNetworks(validPendingNetworks.map(({ network }) => network));
    }

    if (selectedHistoryNetworks.length === 0 && validHistoryNetworks.length > 0) {
      setSelectedHistoryNetworks(validHistoryNetworks.map(({ network }) => network).slice(0, 1));
    }
  }, [selectedPendingNetworks, selectedHistoryNetworks, validPendingNetworks, validHistoryNetworks]);

  return (
    <>
      <div className='space-y-5'>
        <div className='flex items-center justify-between'>
          <Tabs
            color='primary'
            aria-label='Transaction'
            selectedKey={type}
            onSelectionChange={(key) => setType(key.toString())}
          >
            <Tab key='pending' title='Pending' />
            <Tab key='history' title='History' />
          </Tabs>
          {type === 'pending' && validPendingNetworks.length > 0 && (
            <Button
              radius='md'
              variant='bordered'
              color='default'
              className='border-divider-300'
              startContent={<Avatar src={validPendingNetworks[0].chain.icon} className='w-4 h-4 bg-transparent' />}
              endContent={<ArrowDown className='w-4 h-4' />}
              onPress={toggleOpen}
            >
              {validPendingNetworks.length > 1
                ? `${validPendingNetworks[0].chain.name} and other ${validPendingNetworks.length - 1}`
                : `${validPendingNetworks[0].chain.name}(${validPendingNetworks[0].counts})`}
            </Button>
          )}
          {type === 'history' && validHistoryNetworks.length > 0 && (
            <Button
              radius='md'
              variant='bordered'
              color='default'
              className='border-divider-300'
              startContent={<Avatar src={validHistoryNetworks[0].chain.icon} className='w-4 h-4 bg-transparent' />}
              endContent={<ArrowDown className='w-4 h-4' />}
              onPress={toggleOpen}
            >
              {validHistoryNetworks.length > 1
                ? `${validHistoryNetworks[0].chain.name} and other ${validHistoryNetworks.length - 1}`
                : `${validHistoryNetworks[0].chain.name}(${validHistoryNetworks[0].counts})`}
            </Button>
          )}
        </div>
        {type === 'pending' && <PendingTransactions networks={selectedPendingNetworks} address={address} txId={txId} />}
        {type === 'history' && (
          <HistoryTransactions network={selectedHistoryNetworks[0]} address={address} txId={txId} />
        )}
      </div>

      <Drawer isOpen={isOpen} onOpenChange={toggleOpen} size='xs'>
        <DrawerContent>
          <DrawerHeader>Select Network</DrawerHeader>
          <DrawerBody>
            <Listbox
              disallowEmptySelection
              selectedKeys={type === 'pending' ? selectedPendingNetworks : selectedHistoryNetworks}
              selectionMode={type === 'pending' ? 'multiple' : 'single'}
              className=''
              variant='flat'
              onSelectionChange={
                type === 'pending'
                  ? (keys) =>
                      keys === 'all'
                        ? setSelectedPendingNetworks(validPendingNetworks.map(({ network }) => network))
                        : setSelectedPendingNetworks(Array.from(keys).map((key) => key.toString()))
                  : (keys) =>
                      keys === 'all'
                        ? setSelectedHistoryNetworks(validHistoryNetworks.map(({ network }) => network))
                        : setSelectedHistoryNetworks(Array.from(keys).map((key) => key.toString()))
              }
              color='primary'
            >
              {(type === 'pending' ? validPendingNetworks : validHistoryNetworks).map(({ network, chain, counts }) => (
                <ListboxItem
                  key={network}
                  startContent={<Avatar src={chain.icon} className='w-4 h-4 bg-transparent' />}
                  classNames={{
                    selectedIcon: 'w-auto h-auto'
                  }}
                  selectedIcon={(props) => (
                    <Checkbox
                      classNames={{ wrapper: 'mr-0' }}
                      className='p-0'
                      size='sm'
                      isSelected={props.isSelected}
                      isDisabled={props.isDisabled}
                      onValueChange={
                        type === 'pending'
                          ? (isSelected) => {
                              if (isSelected) {
                                setSelectedPendingNetworks((prev) => Array.from(new Set([...prev, network])));
                              } else {
                                setSelectedPendingNetworks((prev) =>
                                  prev.length === 1 ? prev : prev.filter((n) => n !== network)
                                );
                              }
                            }
                          : (isSelected) => {
                              if (isSelected) {
                                setSelectedHistoryNetworks((prev) => Array.from(new Set([...prev, network])));
                              } else {
                                setSelectedHistoryNetworks((prev) =>
                                  prev.length === 1 ? prev : prev.filter((n) => n !== network)
                                );
                              }
                            }
                      }
                    />
                  )}
                >
                  {chain.name}({counts})
                </ListboxItem>
              ))}
            </Listbox>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}

function PageTransaction() {
  const selected = useSelectedAccount();

  if (!selected) return null;

  return <Content key={selected} address={selected} />;
}

export default PageTransaction;
