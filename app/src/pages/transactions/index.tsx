// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useSelectedAccount } from '@/accounts/useSelectedAccount';
import ArrowDown from '@/assets/svg/ArrowDown.svg?react';
import { useQueryParam } from '@/hooks/useQueryParams';
import { useValidTransactionNetworks } from '@/hooks/useTransactions';
import { useEffect, useMemo, useState } from 'react';

import {
  Avatar,
  Button,
  Checkbox,
  Listbox,
  ListboxItem,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Tab,
  Tabs
} from '@mimir-wallet/ui';

import HistoryTransactions from './HistoryTransactions';
import PendingTransactions from './PendingTransactions';

function Content({ address }: { address: string }) {
  const [{ validPendingNetworks, validHistoryNetworks }, isFetched, isFetching] = useValidTransactionNetworks(address);
  const [selectedPendingNetworks, setSelectedPendingNetworks] = useState<string[]>([]);
  const [selectedHistoryNetworks, setSelectedHistoryNetworks] = useState<string[]>([]);
  const selectedPendingNetwork = useMemo(() => {
    return validPendingNetworks.find(({ network }) => selectedPendingNetworks.includes(network));
  }, [validPendingNetworks, selectedPendingNetworks]);
  const selectedHistoryNetwork = useMemo(() => {
    return validHistoryNetworks.find(({ network }) => selectedHistoryNetworks.includes(network));
  }, [validHistoryNetworks, selectedHistoryNetworks]);

  const [type, setType] = useQueryParam<string>('status', 'pending');
  const [txId] = useQueryParam<string>('tx_id');

  useEffect(() => {
    setSelectedPendingNetworks((selectedPendingNetworks) => {
      if (selectedPendingNetworks.length === 0 && validPendingNetworks.length > 0) {
        return validPendingNetworks.map(({ network }) => network);
      } else if (validPendingNetworks.length > 0) {
        return Array.from(
          new Set(
            selectedPendingNetworks
              .filter((network) => validPendingNetworks.some(({ network: n }) => n === network))
              .concat(validPendingNetworks.map(({ network }) => network))
          )
        );
      } else {
        return selectedPendingNetworks;
      }
    });

    setSelectedHistoryNetworks((selectedHistoryNetworks) => {
      if (selectedHistoryNetworks.length === 0 && validHistoryNetworks.length > 0) {
        return validHistoryNetworks.map(({ network }) => network).slice(0, 1);
      } else if (validHistoryNetworks.length > 0) {
        return Array.from(
          new Set(
            selectedHistoryNetworks
              .filter((network) => validHistoryNetworks.some(({ network: n }) => n === network))
              .concat(validHistoryNetworks.map(({ network }) => network))
          )
        ).slice(0, 1);
      } else {
        return selectedHistoryNetworks;
      }
    });
  }, [validPendingNetworks, validHistoryNetworks]);

  return (
    <div className='space-y-5'>
      <div className='flex items-center justify-between gap-2'>
        <div className='flex-1'>
          <Tabs
            color='primary'
            aria-label='Transaction'
            selectedKey={type}
            onSelectionChange={(key) => setType(key.toString())}
          >
            <Tab key='pending' title='Pending' />
            <Tab key='history' title='History' />
          </Tabs>
        </div>

        {type === 'pending' &&
          validPendingNetworks.length > 0 &&
          (validPendingNetworks.length > 1 ? (
            <Popover placement='bottom-end'>
              <PopoverTrigger>
                <Button
                  radius='md'
                  variant='bordered'
                  color='default'
                  className='border-divider-300 h-8'
                  startContent={<Avatar src={selectedPendingNetwork?.chain.icon} className='h-4 w-4 bg-transparent' />}
                  endContent={<ArrowDown className='h-4 w-4' />}
                >
                  {selectedPendingNetworks.length > 1 ? (
                    <>
                      {selectedPendingNetwork?.chain.name} and other {selectedPendingNetworks.length - 1}
                    </>
                  ) : (
                    selectedPendingNetwork?.chain.name
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className='rounded-medium w-[200px] p-1'>
                <Listbox
                  disallowEmptySelection
                  selectedKeys={selectedPendingNetworks}
                  selectionMode='multiple'
                  variant='flat'
                  onSelectionChange={(keys) =>
                    keys === 'all'
                      ? setSelectedPendingNetworks(validPendingNetworks.map(({ network }) => network))
                      : setSelectedPendingNetworks(Array.from(keys).map((key) => key.toString()))
                  }
                  color='primary'
                >
                  {validPendingNetworks.map(({ network, chain, counts }) => (
                    <ListboxItem
                      key={network}
                      startContent={<Avatar src={chain.icon} className='h-4 w-4 bg-transparent' />}
                      className='data-[hover]:bg-secondary data-[hover]:text-foreground data-[selectable=true]:focus:bg-secondary data-[selectable=true]:focus:text-foreground h-8'
                      classNames={{
                        selectedIcon: 'w-auto h-auto'
                      }}
                      selectedIcon={(props) => (
                        <Checkbox
                          className='pointer-events-none p-0'
                          size='sm'
                          isSelected={props.isSelected}
                          isDisabled={props.isDisabled}
                        />
                      )}
                    >
                      {chain.name}({counts})
                    </ListboxItem>
                  ))}
                </Listbox>
              </PopoverContent>
            </Popover>
          ) : (
            <Button
              radius='md'
              variant='bordered'
              color='default'
              className='border-divider-300 h-8'
              startContent={<Avatar src={validPendingNetworks[0].chain.icon} className='h-4 w-4 bg-transparent' />}
            >
              {validPendingNetworks[0].chain.name}({validPendingNetworks[0].counts})
            </Button>
          ))}
        {type === 'history' &&
          validHistoryNetworks.length > 0 &&
          (validHistoryNetworks.length > 1 ? (
            <Popover placement='bottom-end'>
              <PopoverTrigger>
                <Button
                  radius='md'
                  variant='bordered'
                  color='default'
                  className='border-divider-300 h-8'
                  startContent={<Avatar src={selectedHistoryNetwork?.chain.icon} className='h-4 w-4 bg-transparent' />}
                  endContent={<ArrowDown className='h-4 w-4' />}
                >
                  {selectedHistoryNetwork?.chain.name}({selectedHistoryNetwork?.counts})
                </Button>
              </PopoverTrigger>
              <PopoverContent className='rounded-medium w-[200px] p-1'>
                <Listbox
                  disallowEmptySelection
                  selectedKeys={selectedHistoryNetworks}
                  selectionMode={'single'}
                  variant='flat'
                  onSelectionChange={(keys) =>
                    keys === 'all'
                      ? setSelectedHistoryNetworks(validHistoryNetworks.map(({ network }) => network))
                      : setSelectedHistoryNetworks(Array.from(keys).map((key) => key.toString()))
                  }
                  color='primary'
                >
                  {validHistoryNetworks.map(({ network, chain, counts }) => (
                    <ListboxItem
                      key={network}
                      className='data-[hover]:bg-secondary data-[hover]:text-foreground data-[selectable=true]:focus:bg-secondary data-[selectable=true]:focus:text-foreground h-8'
                      startContent={<Avatar src={chain.icon} className='h-4 w-4 bg-transparent' />}
                    >
                      {chain.name}({counts})
                    </ListboxItem>
                  ))}
                </Listbox>
              </PopoverContent>
            </Popover>
          ) : (
            <Button
              radius='md'
              variant='bordered'
              color='default'
              className='border-divider-300 h-8'
              startContent={<Avatar src={validHistoryNetworks[0].chain.icon} className='h-4 w-4 bg-transparent' />}
            >
              {validHistoryNetworks[0].chain.name}({validHistoryNetworks[0].counts})
            </Button>
          ))}
      </div>

      {type === 'pending' && (
        <PendingTransactions
          isFetched={isFetched}
          isFetching={isFetching}
          networks={selectedPendingNetworks}
          address={address}
          txId={txId}
        />
      )}
      {type === 'history' && (
        <HistoryTransactions
          isFetched={isFetched}
          isFetching={isFetching}
          network={selectedHistoryNetworks.at(0)}
          address={address}
          txId={txId}
        />
      )}
    </div>
  );
}

function PageTransaction() {
  const selected = useSelectedAccount();

  if (!selected) return null;

  return <Content key={selected} address={selected} />;
}

export default PageTransaction;
