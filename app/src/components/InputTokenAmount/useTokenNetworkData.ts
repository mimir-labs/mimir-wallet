// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { TokenNetworkDataResult, TokenNetworkItem } from './types';
import type { Endpoint, Network } from '@mimir-wallet/polkadot-core';

import { useChains } from '@mimir-wallet/polkadot-core';
import { useMemo } from 'react';

import {
  calculateUsdValue,
  createTokenNetworkKey,
  sortByUsdValue,
} from './utils';

import {
  useAllChainBalances,
  useChainBalances,
} from '@/hooks/useChainBalances';
import { useRecentNetworks } from '@/hooks/useRecentNetworks';

interface UseTokenNetworkDataOptions {
  /** Only include these networks */
  supportedNetworks?: string[];
  /** Include tokens with zero balance */
  includeZeroBalance?: boolean;
  /** Active network filter from UI (when user selects a specific network) */
  activeNetworkFilter?: string | null;
}

/**
 * Hook to aggregate token and network data for InputTokenAmount
 * Combines balance data from all chains with network configuration
 *
 * Optimization: When user filters by a specific network, uses useChainBalances
 * instead of useAllChainBalances for better performance.
 *
 * @param address - Account address to query balances for
 * @param options - Configuration options
 * @returns TokenNetworkDataResult with items, networks, loading state
 */
export function useTokenNetworkData(
  address?: string,
  options?: UseTokenNetworkDataOptions,
): TokenNetworkDataResult {
  const {
    supportedNetworks,
    includeZeroBalance = false,
    activeNetworkFilter,
  } = options || {};

  // Use single chain query when user filters by a specific network
  const [filteredChainData, filteredChainFetched] = useChainBalances(
    activeNetworkFilter ?? undefined,
    address,
    { alwaysIncludeNative: true },
  );

  // Multi network: use useAllChainBalances (always enabled for "All" filter)
  const allChainBalances = useAllChainBalances(address, {
    alwaysIncludeNative: false,
  });

  // Get network configurations
  const { chains } = useChains();

  // Get recent networks for sorting
  const { recentNetworks } = useRecentNetworks();

  // Create a map for quick network lookup
  const networkMap = useMemo(() => {
    const map = new Map<string, Endpoint>();

    for (const chain of chains) {
      map.set(chain.key, chain);
    }

    return map;
  }, [chains]);

  // Filter networks based on supportedNetworks
  const filteredNetworkKeys = useMemo(() => {
    if (supportedNetworks && supportedNetworks.length > 0) {
      return new Set(supportedNetworks);
    }

    return null; // null means all networks
  }, [supportedNetworks]);

  // Determine which networks to show in filter tabs
  // Priority: recent networks first, then enabled, then disabled
  const displayNetworks = useMemo(() => {
    // Create priority map for recent networks
    const recentPriorityMap = new Map<string, number>();

    recentNetworks.forEach((key, index) => {
      recentPriorityMap.set(key, index);
    });

    const sortByPriority = (networks: Network[]): Network[] => {
      return [...networks].sort((a, b) => {
        const aRecent = recentPriorityMap.get(a.key);
        const bRecent = recentPriorityMap.get(b.key);

        // Recent networks first (lower index = more recent)
        if (aRecent !== undefined && bRecent !== undefined) {
          return aRecent - bRecent;
        }

        if (aRecent !== undefined) {
          return -1;
        }

        if (bRecent !== undefined) {
          return 1;
        }

        // Then sort by enabled status
        if (a.enabled !== b.enabled) {
          return a.enabled ? -1 : 1;
        }

        return 0;
      });
    };

    // If supportedNetworks is specified, only show those
    if (filteredNetworkKeys) {
      const filtered = chains.filter((chain) =>
        filteredNetworkKeys.has(chain.key),
      );

      return sortByPriority(filtered);
    }

    // Otherwise show all networks
    return sortByPriority(chains);
  }, [chains, filteredNetworkKeys, recentNetworks]);

  // Aggregate and transform data (progressive loading like assets page)
  const { items, allFetched } = useMemo(() => {
    const tokenItems: TokenNetworkItem[] = [];

    // Single network filter mode: use filteredChainData for better performance
    if (activeNetworkFilter) {
      const network = networkMap.get(activeNetworkFilter);

      if (network && filteredChainData) {
        for (const tokenBalance of filteredChainData) {
          // Skip zero balance tokens unless explicitly included
          if (!includeZeroBalance && tokenBalance.transferrable <= 0n) {
            continue;
          }

          // Calculate USD value
          const usdValue = calculateUsdValue(
            tokenBalance.transferrable,
            tokenBalance.decimals,
            tokenBalance.price,
          );

          // Create unique key
          const identifier = tokenBalance.isNative
            ? 'native'
            : tokenBalance.key;
          const key = createTokenNetworkKey(activeNetworkFilter, identifier);

          tokenItems.push({
            network,
            token: tokenBalance,
            usdValue,
            key,
          });
        }
      }

      return {
        items: sortByUsdValue(tokenItems),
        allFetched: filteredChainFetched,
      };
    }

    // All networks mode: use allChainBalances
    let allDone = true;

    for (const chainBalance of allChainBalances) {
      const { chain, data, isFetched: chainFetched } = chainBalance;

      // Check if this network should be included
      if (filteredNetworkKeys && !filteredNetworkKeys.has(chain)) {
        continue;
      }

      const network = networkMap.get(chain);

      if (!network) {
        continue;
      }

      // Track if all chains have been fetched (for progressive loading)
      if (chainFetched) {
        // Process balance data only when fetched
        if (data) {
          for (const tokenBalance of data) {
            // Skip zero balance tokens unless explicitly included
            if (!includeZeroBalance && tokenBalance.transferrable <= 0n) {
              continue;
            }

            // Calculate USD value
            const usdValue = calculateUsdValue(
              tokenBalance.transferrable,
              tokenBalance.decimals,
              tokenBalance.price,
            );

            // Create unique key
            const identifier = tokenBalance.isNative
              ? 'native'
              : tokenBalance.key;
            const key = createTokenNetworkKey(chain, identifier);

            tokenItems.push({
              network,
              token: tokenBalance,
              usdValue,
              key,
            });
          }
        }
      } else {
        // Not all chains fetched yet
        allDone = false;
      }
    }

    return {
      items: sortByUsdValue(tokenItems),
      allFetched: allDone,
    };
  }, [
    activeNetworkFilter,
    filteredChainData,
    filteredChainFetched,
    allChainBalances,
    networkMap,
    filteredNetworkKeys,
    includeZeroBalance,
  ]);

  return {
    items,
    networks: displayNetworks,
    isLoading: !allFetched,
    isFetched: allFetched,
  };
}
