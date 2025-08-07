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
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
  Tab,
  Tabs
} from '@mimir-wallet/ui';

import HistoryTransactions from './HistoryTransactions';
import PendingTransactions from './PendingTransactions';

function Content({ address }: { address: string }) {
  const [{ validPendingNetworks, validHistoryNetworks }, isFetched, isFetching] = useValidTransactionNetworks(address);
  const [selectedPendingNetworks, setSelectedPendingNetworks] = useState<string[]>([]);
  const [selectedHistoryNetworks, setSelectedHistoryNetworks] = useState<string[]>([]);
  const [pendingDropdownOpen, setPendingDropdownOpen] = useState(false);
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
            <DropdownMenu open={pendingDropdownOpen} onOpenChange={setPendingDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <Button radius='md' variant='bordered' className='border-divider-300 h-8 text-inherit'>
                  <Avatar src={selectedPendingNetwork?.chain.icon} className='h-4 w-4 bg-transparent' />
                  {selectedPendingNetworks.length > 1 ? (
                    <>
                      {selectedPendingNetwork?.chain.name} and other {selectedPendingNetworks.length - 1}
                    </>
                  ) : (
                    selectedPendingNetwork?.chain.name
                  )}
                  <ArrowDown className='h-4 w-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side='bottom' align='end' className='w-[200px]'>
                {validPendingNetworks.map(({ network, chain, counts }) => (
                  <DropdownMenuCheckboxItem
                    key={network}
                    checked={selectedPendingNetworks.includes(network)}
                    onSelect={(e) => e.preventDefault()}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedPendingNetworks([...selectedPendingNetworks, network]);
                      } else {
                        const remaining = selectedPendingNetworks.filter((n) => n !== network);

                        if (remaining.length > 0) {
                          setSelectedPendingNetworks(remaining);
                        }
                      }
                    }}
                    className='h-8'
                  >
                    <Avatar src={chain.icon} className='mr-2 h-4 w-4 bg-transparent' />
                    {chain.name}({counts})
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button radius='md' variant='bordered' className='border-divider-300 h-8 text-inherit'>
              <Avatar src={validPendingNetworks[0].chain.icon} className='h-4 w-4 bg-transparent' />
              {validPendingNetworks[0].chain.name}({validPendingNetworks[0].counts})
            </Button>
          ))}
        {type === 'history' &&
          validHistoryNetworks.length > 0 &&
          (validHistoryNetworks.length > 1 ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button radius='md' variant='bordered' className='border-divider-300 h-8 text-inherit'>
                  <Avatar src={selectedHistoryNetwork?.chain.icon} className='h-4 w-4 bg-transparent' />
                  {selectedHistoryNetwork?.chain.name}({selectedHistoryNetwork?.counts})
                  <ArrowDown className='h-4 w-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side='bottom' align='end' className='w-[200px]'>
                <DropdownMenuRadioGroup
                  value={selectedHistoryNetworks[0]}
                  onValueChange={(value) => setSelectedHistoryNetworks([value])}
                >
                  {validHistoryNetworks.map(({ network, chain, counts }) => (
                    <DropdownMenuRadioItem key={network} value={network} className='h-8'>
                      <Avatar src={chain.icon} className='mr-2 h-4 w-4 bg-transparent' />
                      {chain.name}({counts})
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button radius='md' variant='bordered' className='border-divider-300 h-8 text-inherit'>
              <Avatar src={validHistoryNetworks[0].chain.icon} className='h-4 w-4 bg-transparent' />
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
