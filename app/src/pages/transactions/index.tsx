// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { TabItem } from '@mimir-wallet/ui';

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
  Tabs,
  Tooltip,
} from '@mimir-wallet/ui';
import { getRouteApi, useNavigate } from '@tanstack/react-router';
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from 'react';

import AllHistoryTransactions from './AllHistoryTransactions';
import HistoryTransactions from './HistoryTransactions';
import PendingTransactions from './PendingTransactions';

import { useAccountMeta } from '@/accounts/useAccountMeta';
import { useSelectedAccount } from '@/accounts/useSelectedAccount';
import { analyticsActions } from '@/analytics';
import ArrowDown from '@/assets/svg/ArrowDown.svg?react';
import IconQuestion from '@/assets/svg/icon-question-fill.svg?react';
import { useValidTransactionNetworks } from '@/hooks/useTransactions';
import { getChainsWithSubscanSupport } from '@/utils/networkGrouping';

const routeApi = getRouteApi('/_authenticated/transactions/');

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
      {} as Record<string, (typeof chains)[0]>,
    );
  }, [chains]);
  const meta = useAccountMeta(address);
  const [
    { validPendingNetworks, validHistoryNetworks },
    isFetched,
    isFetching,
  ] = useValidTransactionNetworks(address);

  // Show All History tab only for non-multisig and non-pure accounts
  const showAllHistoryTab = useMemo(() => {
    return !meta?.isMultisig && !meta?.isPure;
  }, [meta]);
  // User's preferred network selections
  const [preferredPendingNetworks, setPreferredPendingNetworks] = useState<
    string[]
  >([]);
  const [preferredHistoryNetworks, setPreferredHistoryNetworks] = useState<
    string[]
  >([]);
  // User's preferred all-history network selection
  const [preferredAllHistoryNetwork, setPreferredAllHistoryNetwork] = useState<
    string | undefined
  >(undefined);
  const [pendingDropdownOpen, setPendingDropdownOpen] = useState(false);

  // Get chains with Subscan support for All History tab
  const subscanChains = useMemo(() => {
    const chainsWithSubscan = getChainsWithSubscanSupport();

    return chainsWithSubscan
      .filter((chain) => allApis[chain.key]) // Only show enabled chains
      .map((chain) => ({
        network: chain.key,
        chain,
      }));
  }, [allApis]);

  // Derive effective all-history network: use preference or fallback to first subscan chain
  const selectedAllHistoryNetwork = useMemo(() => {
    if (preferredAllHistoryNetwork !== undefined) {
      return preferredAllHistoryNetwork;
    }

    return subscanChains[0]?.network;
  }, [preferredAllHistoryNetwork, subscanChains]);

  // Setter that updates the preferred value
  const setSelectedAllHistoryNetwork = useCallback(
    (network: string | undefined) => {
      setPreferredAllHistoryNetwork(network);
    },
    [],
  );

  // Derive effective pending networks: use preference or fallback to all valid networks
  const selectedPendingNetworks = useMemo(() => {
    if (
      preferredPendingNetworks.length === 0 &&
      validPendingNetworks.length > 0
    ) {
      return validPendingNetworks.map(({ network }) => network);
    } else if (validPendingNetworks.length > 0) {
      // Filter out invalid networks and add new valid ones
      return Array.from(
        new Set(
          preferredPendingNetworks.filter((network) =>
            validPendingNetworks.some(({ network: n }) => n === network),
          ),
        ),
      );
    }

    return preferredPendingNetworks;
  }, [preferredPendingNetworks, validPendingNetworks]);

  // Derive effective history networks: use preference or fallback to first valid network
  const selectedHistoryNetworks = useMemo(() => {
    if (
      preferredHistoryNetworks.length === 0 &&
      validHistoryNetworks.length > 0
    ) {
      return [validHistoryNetworks[0].network];
    } else if (validHistoryNetworks.length > 0) {
      const valid = preferredHistoryNetworks.filter((network) =>
        validHistoryNetworks.some(({ network: n }) => n === network),
      );

      if (valid.length === 0) {
        return [validHistoryNetworks[0].network];
      }

      return valid.slice(0, 1);
    }

    return preferredHistoryNetworks.slice(0, 1);
  }, [preferredHistoryNetworks, validHistoryNetworks]);

  // Setters that update the preferred values
  const setSelectedPendingNetworks = useCallback(
    (networks: string[] | ((prev: string[]) => string[])) => {
      if (typeof networks === 'function') {
        setPreferredPendingNetworks((prev) => networks(prev));
      } else {
        setPreferredPendingNetworks(networks);
      }
    },
    [],
  );

  const setSelectedHistoryNetworks = useCallback(
    (networks: string[] | ((prev: string[]) => string[])) => {
      if (typeof networks === 'function') {
        setPreferredHistoryNetworks((prev) => networks(prev));
      } else {
        setPreferredHistoryNetworks(networks);
      }
    },
    [],
  );

  const [, startTransition] = useTransition();
  const selectedPendingNetwork = useMemo(() => {
    return validPendingNetworks.find(({ network }) =>
      selectedPendingNetworks.includes(network),
    );
  }, [validPendingNetworks, selectedPendingNetworks]);
  const selectedHistoryNetwork = useMemo(() => {
    return validHistoryNetworks.find(({ network }) =>
      selectedHistoryNetworks.includes(network),
    );
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
        search: { ...search, status: newStatus },
      });
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full sm:flex-1">
          <Tabs
            tabs={
              [
                { key: 'pending', label: 'Pending' },
                { key: 'history', label: 'History' },
                showAllHistoryTab
                  ? {
                      key: 'all-history',
                      label: (
                        <span className="inline-flex items-center gap-1">
                          All History
                          <Tooltip
                            content="Single-Signature accounts' all transactions sync
                            from Subscan"
                          >
                            <IconQuestion className="text-primary" />
                          </Tooltip>
                        </span>
                      ),
                    }
                  : null,
              ].filter(Boolean) as TabItem[]
            }
            selectedKey={status}
            onSelectionChange={(key) => {
              const viewType = key.toString();

              handleStatusChange(viewType);
              // Track transactions view
              analyticsActions.transactionsView(
                viewType as 'pending' | 'history',
              );
            }}
          />
        </div>

        <div className="flex items-center justify-between gap-2">
          {status === 'pending' && (
            <span className="inline-flex items-center gap-2">
              <label className="inline-flex cursor-pointer items-center gap-2">
                <Checkbox
                  checked={showDiscarded}
                  onCheckedChange={(checked) => setShowDiscarded(!!checked)}
                />
                <span className="flex items-center gap-1">
                  Discarded Transactions({discardedCounts})
                </span>
              </label>
              <Tooltip
                content={
                  <div>
                    These transactions have now been discarded due to Assethub
                    Migration.
                    <br />
                    You can re-initiate them on Assethub.
                    <br />
                    <b>
                      Deposit has been refunded to your account on Assethub.
                    </b>
                  </div>
                }
              >
                <IconQuestion className="text-primary" />
              </Tooltip>
            </span>
          )}

          {status === 'pending' &&
            validPendingNetworks.length > 0 &&
            (validPendingNetworks.length > 1 ? (
              <DropdownMenu
                open={pendingDropdownOpen}
                onOpenChange={setPendingDropdownOpen}
              >
                <DropdownMenuTrigger asChild>
                  <Button
                    radius="md"
                    variant="bordered"
                    className="border-border h-8 text-inherit bg-background"
                  >
                    <Avatar
                      src={selectedPendingNetwork?.chain.icon}
                      className="h-4 w-4 bg-transparent"
                    />
                    {selectedPendingNetworks.length > 1 ? (
                      <>
                        {selectedPendingNetwork?.chain.name} and other{' '}
                        {selectedPendingNetworks.length - 1}
                      </>
                    ) : (
                      selectedPendingNetwork?.chain.name
                    )}
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="bottom" align="end" className="w-60">
                  {validPendingNetworks.map(({ network, chain, counts }) => (
                    <DropdownMenuCheckboxItem
                      key={network}
                      checked={selectedPendingNetworks.includes(network)}
                      onSelect={(e) => e.preventDefault()}
                      onCheckedChange={(checked) => {
                        // Wrap network selection in transition for non-blocking updates
                        startTransition(() => {
                          if (checked) {
                            setSelectedPendingNetworks([
                              ...selectedPendingNetworks,
                              network,
                            ]);
                          } else {
                            const remaining = selectedPendingNetworks.filter(
                              (n) => n !== network,
                            );

                            if (remaining.length > 0) {
                              setSelectedPendingNetworks(remaining);
                            }
                          }
                        });
                      }}
                      className="h-8"
                    >
                      <Avatar
                        src={chain.icon}
                        className="mr-2 h-4 w-4 bg-transparent"
                      />
                      {chain.name}({counts})
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                radius="md"
                variant="bordered"
                className="border-border h-8 text-inherit bg-background"
              >
                <Avatar
                  src={validPendingNetworks[0].chain.icon}
                  className="h-4 w-4 bg-transparent"
                />
                {validPendingNetworks[0].chain.name}(
                {validPendingNetworks[0].counts})
              </Button>
            ))}
          {status === 'history' &&
            validHistoryNetworks.length > 0 &&
            (validHistoryNetworks.length > 1 ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    radius="md"
                    variant="bordered"
                    className="border-border h-8 text-inherit bg-background"
                  >
                    <Avatar
                      src={selectedHistoryNetwork?.chain.icon}
                      className="h-4 w-4 bg-transparent"
                    />
                    {selectedHistoryNetwork?.chain.name}(
                    {selectedHistoryNetwork?.counts})
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="bottom" align="end" className="w-60">
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
                      <DropdownMenuRadioItem
                        key={network}
                        value={network}
                        className="h-8"
                      >
                        <Avatar
                          src={chain.icon}
                          className="mr-2 h-4 w-4 bg-transparent"
                        />
                        {chain.name}({counts})
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                radius="md"
                variant="bordered"
                className="border-border h-8 text-inherit bg-background"
              >
                <Avatar
                  src={validHistoryNetworks[0].chain.icon}
                  className="h-4 w-4 bg-transparent"
                />
                {validHistoryNetworks[0].chain.name}(
                {validHistoryNetworks[0].counts})
              </Button>
            ))}
          {showAllHistoryTab &&
            status === 'all-history' &&
            subscanChains.length > 0 &&
            (subscanChains.length > 1 ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    radius="md"
                    variant="bordered"
                    className="border-border h-8 text-inherit bg-background"
                  >
                    <Avatar
                      src={
                        subscanChains.find(
                          (c) => c.network === selectedAllHistoryNetwork,
                        )?.chain.icon
                      }
                      className="h-4 w-4 bg-transparent"
                    />
                    {
                      subscanChains.find(
                        (c) => c.network === selectedAllHistoryNetwork,
                      )?.chain.name
                    }
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="bottom" align="end" className="w-60">
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
                      <DropdownMenuRadioItem
                        key={network}
                        value={network}
                        className="h-8"
                      >
                        <Avatar
                          src={chain.icon}
                          className="mr-2 h-4 w-4 bg-transparent"
                        />
                        {chain.name}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                radius="md"
                variant="bordered"
                className="border-border h-8 text-inherit bg-background"
              >
                <Avatar
                  src={subscanChains[0].chain.icon}
                  className="h-4 w-4 bg-transparent"
                />
                {subscanChains[0].chain.name}
              </Button>
            ))}
        </div>
      </div>

      {status === 'pending' && (
        <PendingTransactions
          showDiscarded={showDiscarded}
          isFetched={isFetched}
          isFetching={isFetching}
          networks={selectedPendingNetworks}
          address={address}
          txId={txId}
          onDiscardedCountsChange={setDiscardedCounts}
        />
      )}
      {status === 'history' && (
        <HistoryTransactions
          isFetched={isFetched}
          isFetching={isFetching}
          network={selectedHistoryNetworks.at(0)}
          address={address}
          txId={txId}
        />
      )}
      {showAllHistoryTab && status === 'all-history' && (
        <AllHistoryTransactions
          isFetched={isFetched}
          isFetching={isFetching}
          network={selectedAllHistoryNetwork}
          address={address}
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
