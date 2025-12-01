// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useChains } from '@mimir-wallet/polkadot-core';
import {
  Avatar,
  Button,
  Checkbox,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
  Spinner,
  Tab,
  Tabs,
  Tooltip
} from '@mimir-wallet/ui';
import { getRouteApi, useNavigate } from '@tanstack/react-router';
import { lazy, Suspense, useEffect, useMemo, useState, useTransition } from 'react';

import { useAccountMeta } from '@/accounts/useAccountMeta';
import { useSelectedAccount } from '@/accounts/useSelectedAccount';
import { analyticsActions } from '@/analytics';
import ArrowDown from '@/assets/svg/ArrowDown.svg?react';
import IconQuestion from '@/assets/svg/icon-question-fill.svg?react';
import { useValidTransactionNetworks } from '@/hooks/useTransactions';
import { getChainsWithSubscanSupport } from '@/utils/networkGrouping';

const routeApi = getRouteApi('/_authenticated/transactions/');

// Lazy load transaction list components for better code splitting
const HistoryTransactions = lazy(() => import('./HistoryTransactions'));
const PendingTransactions = lazy(() => import('./PendingTransactions'));
const AllHistoryTransactions = lazy(() => import('./AllHistoryTransactions'));

// Loading fallback for transaction lists
function TransactionListFallback() {
  return (
    <div className='flex h-64 items-center justify-center'>
      <Spinner variant='wave' />
    </div>
  );
}

function Content({ address }: { address: string }) {
  const navigate = useNavigate();
  const search = routeApi.useSearch();
  const status = search.status;
  const txId = search.tx_id;

  const { chains } = useChains();
  const allApis = useMemo(() => {
    return chains.reduce(
      (acc, chain) => {
        acc[chain.key] = chain;

        return acc;
      },
      {} as Record<string, (typeof chains)[0]>
    );
  }, [chains]);
  const meta = useAccountMeta(address);
  const [{ validPendingNetworks, validHistoryNetworks }, isFetched, isFetching] = useValidTransactionNetworks(address);

  // Show All History tab only for non-multisig and non-pure accounts
  const showAllHistoryTab = useMemo(() => {
    return !meta?.isMultisig && !meta?.isPure;
  }, [meta]);
  const [selectedPendingNetworks, setSelectedPendingNetworks] = useState<string[]>([]);
  const [selectedHistoryNetworks, setSelectedHistoryNetworks] = useState<string[]>([]);
  const [selectedAllHistoryNetwork, setSelectedAllHistoryNetwork] = useState<string | undefined>(undefined);
  const [pendingDropdownOpen, setPendingDropdownOpen] = useState(false);

  // Get chains with Subscan support for All History tab
  const subscanChains = useMemo(() => {
    const chainsWithSubscan = getChainsWithSubscanSupport();

    return chainsWithSubscan
      .filter((chain) => allApis[chain.key]) // Only show enabled chains
      .map((chain) => ({
        network: chain.key,
        chain
      }));
  }, [allApis]);

  const [, startTransition] = useTransition();
  const selectedPendingNetwork = useMemo(() => {
    return validPendingNetworks.find(({ network }) => selectedPendingNetworks.includes(network));
  }, [validPendingNetworks, selectedPendingNetworks]);
  const selectedHistoryNetwork = useMemo(() => {
    return validHistoryNetworks.find(({ network }) => selectedHistoryNetworks.includes(network));
  }, [validHistoryNetworks, selectedHistoryNetworks]);

  const [discardedCounts, setDiscardedCounts] = useState(0);
  const [showDiscarded, setShowDiscarded] = useState(false);

  // Track initial page view
  useEffect(() => {
    analyticsActions.transactionsView(status);
  }, [status]); // Only run once on mount

  const handleStatusChange = (key: string | number) => {
    const newStatus = key.toString() as 'pending' | 'history' | 'all-history';

    // Wrap navigation in transition for non-blocking UI updates
    startTransition(() => {
      navigate({
        to: '.',
        search: { ...search, status: newStatus }
      });
    });
  };

  useEffect(() => {
    queueMicrotask(() => {
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
    });
  }, [validPendingNetworks, validHistoryNetworks]);

  // Initialize all-history network selection
  useEffect(() => {
    if (!selectedAllHistoryNetwork && subscanChains.length > 0) {
      queueMicrotask(() => {
        setSelectedAllHistoryNetwork(subscanChains[0].network);
      });
    }
  }, [selectedAllHistoryNetwork, subscanChains]);

  return (
    <div className='space-y-5'>
      <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
        <div className='w-full sm:flex-1'>
          <Tabs
            color='primary'
            aria-label='Transaction'
            selectedKey={status}
            onSelectionChange={(key) => {
              const viewType = key.toString();

              handleStatusChange(viewType);
              // Track transactions view
              analyticsActions.transactionsView(viewType as 'pending' | 'history');
            }}
          >
            <Tab key='pending' title='Pending' />
            <Tab key='history' title='History' />
            {showAllHistoryTab && <Tab key='all-history' title='All History' />}
          </Tabs>
        </div>

        <div className='flex items-center justify-between gap-2'>
          {status === 'pending' && (
            <span className='inline-flex items-center gap-2'>
              <Checkbox size='sm' isSelected={showDiscarded} onValueChange={setShowDiscarded}>
                <span className='flex items-center gap-1'>Discarded Transactions({discardedCounts})</span>
              </Checkbox>
              <Tooltip
                content={
                  <div>
                    These transactions have now been discarded due to Assethub Migration.
                    <br />
                    You can re-initiate them on Assethub.
                    <br />
                    <b>Deposit has been refunded to your account on Assethub.</b>
                  </div>
                }
              >
                <IconQuestion className='text-primary' />
              </Tooltip>
            </span>
          )}

          {status === 'pending' &&
            validPendingNetworks.length > 0 &&
            (validPendingNetworks.length > 1 ? (
              <DropdownMenu open={pendingDropdownOpen} onOpenChange={setPendingDropdownOpen}>
                <DropdownMenuTrigger asChild>
                  <Button
                    radius='md'
                    variant='bordered'
                    className='border-divider-300 max-sm:border-secondary h-8 text-inherit max-sm:bg-white'
                  >
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
                        // Wrap network selection in transition for non-blocking updates
                        startTransition(() => {
                          if (checked) {
                            setSelectedPendingNetworks([...selectedPendingNetworks, network]);
                          } else {
                            const remaining = selectedPendingNetworks.filter((n) => n !== network);

                            if (remaining.length > 0) {
                              setSelectedPendingNetworks(remaining);
                            }
                          }
                        });
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
              <Button
                radius='md'
                variant='bordered'
                className='border-divider-300 max-sm:border-secondary h-8 text-inherit max-sm:bg-white'
              >
                <Avatar src={validPendingNetworks[0].chain.icon} className='h-4 w-4 bg-transparent' />
                {validPendingNetworks[0].chain.name}({validPendingNetworks[0].counts})
              </Button>
            ))}
          {status === 'history' &&
            validHistoryNetworks.length > 0 &&
            (validHistoryNetworks.length > 1 ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    radius='md'
                    variant='bordered'
                    className='border-divider-300 max-sm:border-secondary h-8 text-inherit max-sm:bg-white'
                  >
                    <Avatar src={selectedHistoryNetwork?.chain.icon} className='h-4 w-4 bg-transparent' />
                    {selectedHistoryNetwork?.chain.name}({selectedHistoryNetwork?.counts})
                    <ArrowDown className='h-4 w-4' />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side='bottom' align='end' className='w-[200px]'>
                  <DropdownMenuRadioGroup
                    value={selectedHistoryNetworks[0]}
                    onValueChange={(value) => {
                      // Wrap network selection in transition for non-blocking updates
                      startTransition(() => {
                        setSelectedHistoryNetworks([value]);
                      });
                    }}
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
              <Button
                radius='md'
                variant='bordered'
                className='border-divider-300 max-sm:border-secondary h-8 text-inherit max-sm:bg-white'
              >
                <Avatar src={validHistoryNetworks[0].chain.icon} className='h-4 w-4 bg-transparent' />
                {validHistoryNetworks[0].chain.name}({validHistoryNetworks[0].counts})
              </Button>
            ))}
          {showAllHistoryTab &&
            status === 'all-history' &&
            subscanChains.length > 0 &&
            (subscanChains.length > 1 ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    radius='md'
                    variant='bordered'
                    className='border-divider-300 max-sm:border-secondary h-8 text-inherit max-sm:bg-white'
                  >
                    <Avatar
                      src={subscanChains.find((c) => c.network === selectedAllHistoryNetwork)?.chain.icon}
                      className='h-4 w-4 bg-transparent'
                    />
                    {subscanChains.find((c) => c.network === selectedAllHistoryNetwork)?.chain.name}
                    <ArrowDown className='h-4 w-4' />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side='bottom' align='end' className='w-[200px]'>
                  <DropdownMenuRadioGroup
                    value={selectedAllHistoryNetwork}
                    onValueChange={(value) => {
                      // Wrap network selection in transition for non-blocking updates
                      startTransition(() => {
                        setSelectedAllHistoryNetwork(value);
                      });
                    }}
                  >
                    {subscanChains.map(({ network, chain }) => (
                      <DropdownMenuRadioItem key={network} value={network} className='h-8'>
                        <Avatar src={chain.icon} className='mr-2 h-4 w-4 bg-transparent' />
                        {chain.name}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                radius='md'
                variant='bordered'
                className='border-divider-300 max-sm:border-secondary h-8 text-inherit max-sm:bg-white'
              >
                <Avatar src={subscanChains[0].chain.icon} className='h-4 w-4 bg-transparent' />
                {subscanChains[0].chain.name}
              </Button>
            ))}
        </div>
      </div>

      {status === 'pending' && (
        <Suspense fallback={<TransactionListFallback />}>
          <PendingTransactions
            showDiscarded={showDiscarded}
            isFetched={isFetched}
            isFetching={isFetching}
            networks={selectedPendingNetworks}
            address={address}
            txId={txId}
            onDiscardedCountsChange={setDiscardedCounts}
          />
        </Suspense>
      )}
      {status === 'history' && (
        <Suspense fallback={<TransactionListFallback />}>
          <HistoryTransactions
            isFetched={isFetched}
            isFetching={isFetching}
            network={selectedHistoryNetworks.at(0)}
            address={address}
            txId={txId}
          />
        </Suspense>
      )}
      {showAllHistoryTab && status === 'all-history' && (
        <Suspense fallback={<TransactionListFallback />}>
          <AllHistoryTransactions
            isFetched={isFetched}
            isFetching={isFetching}
            network={selectedAllHistoryNetwork}
            address={address}
          />
        </Suspense>
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
