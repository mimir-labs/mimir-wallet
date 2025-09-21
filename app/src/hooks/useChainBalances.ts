// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { HexString } from '@polkadot/util/types';

import { isEqual } from 'lodash-es';
import { useEffect, useMemo, useState } from 'react';

import {
  type AccountEnhancedAssetBalance,
  addressToHex,
  fetchAccountBalances,
  fetchSingleAssetBalance,
  useApi
} from '@mimir-wallet/polkadot-core';
import { useQueries, useQuery } from '@mimir-wallet/service';

import { useAllXcmAsset, useXcmAsset } from './useXcmAssets';

type ChainBalancesOptions = {
  alwaysIncludeNative?: boolean;
};

/**
 * Hook to get all asset balances for a specific chain and address
 * @param chain - Chain name (e.g., 'polkadot', 'assethub-polkadot')
 * @param address - Account address to query balances for
 * @param options - Optional configuration { alwaysIncludeNative: boolean }
 * @returns [data, isFetched, isFetching] - Array of account balances with asset info
 */
export function useChainBalances(
  chain?: string,
  address?: string,
  options?: ChainBalancesOptions
): [AccountEnhancedAssetBalance[] | undefined, boolean, boolean] {
  const { allApis } = useApi();
  const [allXcmAssets, isXcmAssetsFetched] = useAllXcmAsset();

  const addressHex = useMemo(() => (address ? addressToHex(address) : ''), [address]);
  const api = chain ? allApis[chain] : undefined;

  // Filter XCM assets for the specific chain
  const chainAssets = useMemo(() => {
    if (!allXcmAssets || !chain) return [];

    let assets = allXcmAssets[chain] || [];

    // Ensure native asset is always included if option is enabled
    if (options?.alwaysIncludeNative && assets.length > 0) {
      const nativeAsset = assets.find((asset) => asset.isNative);

      if (nativeAsset) {
        // Remove native asset from current position and add it to the beginning
        assets = [nativeAsset, ...assets.filter((asset) => !asset.isNative)];
      }
    }

    return assets;
  }, [allXcmAssets, chain, options?.alwaysIncludeNative]);

  const { data, isFetched, isFetching } = useQuery({
    queryKey: ['chain-balances', chain, addressHex, options?.alwaysIncludeNative],
    queryFn: async (): Promise<AccountEnhancedAssetBalance[]> => {
      if (!api?.api || !api.isApiReady || !address || !chainAssets.length) {
        throw new Error('API, address, and chain assets are required');
      }

      return fetchAccountBalances(api.api, addressHex as HexString, chainAssets);
    },
    enabled: !!api?.api && !!api.isApiReady && !!address && !!chain && isXcmAssetsFetched && chainAssets.length > 0,
    staleTime: 12_000,
    refetchInterval: 12_000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    structuralSharing: (prev, next) => {
      return isEqual(prev, next) ? prev : next;
    }
  });

  return [data, isFetched, isFetching];
}

type UseAllChainBalances = {
  data: AccountEnhancedAssetBalance[] | undefined;
  isFetched: boolean;
  isFetching: boolean;
  isError: boolean;
  refetch: () => void;
  chain: string;
};

type AllChainBalancesOptions = {
  onlyWithPrice?: boolean;
  alwaysIncludeNative?: boolean;
};

/**
 * Hook to get all asset balances for all chains for a specific address
 * @param address - Account address to query balances for
 * @param options - Optional configuration { onlyWithPrice: boolean, alwaysIncludeNative: boolean }
 * @returns Array of chain balance results
 */
export function useAllChainBalances(address?: string, options?: AllChainBalancesOptions): UseAllChainBalances[] {
  const { allApis } = useApi();
  const [allXcmAssets, isXcmAssetsFetched] = useAllXcmAsset();

  const addressHex = useMemo(() => (address ? addressToHex(address) : ''), [address]);
  const [list, setList] = useState<UseAllChainBalances[]>([]);

  const queries = useQueries({
    queries: Object.entries(allApis).map(([chainName, api]) => {
      let chainAssets = allXcmAssets?.[chainName];

      if (chainAssets) {
        // Find native asset for potential inclusion
        const nativeAsset = chainAssets.find((asset) => asset.isNative);

        // Filter assets with price if option is enabled
        if (options?.onlyWithPrice) {
          chainAssets = chainAssets.filter((asset) => asset.price && asset.price > 0);
        }

        // Always include native asset if option is enabled and it's not already included
        if (options?.alwaysIncludeNative && nativeAsset) {
          const hasNative = chainAssets.some((asset) => asset.isNative);

          if (!hasNative) {
            chainAssets = [nativeAsset, ...chainAssets];
          } else {
            // Ensure native is at the beginning
            chainAssets = [nativeAsset, ...chainAssets.filter((asset) => !asset.isNative)];
          }
        }
      }

      return {
        queryKey: ['chain-balances', chainName, addressHex, options?.onlyWithPrice, options?.alwaysIncludeNative],
        staleTime: 12_000,
        refetchInterval: 12_000,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        enabled:
          !!api?.api &&
          !!api.isApiReady &&
          !!address &&
          !!isXcmAssetsFetched &&
          !!allXcmAssets &&
          !!chainAssets &&
          chainAssets.length > 0,
        queryFn: async (): Promise<AccountEnhancedAssetBalance[]> => {
          if (!addressHex || !chainAssets?.length) {
            return [];
          }

          return fetchAccountBalances(api.api, addressHex as HexString, chainAssets);
        }
      };
    })
  });

  useEffect(() => {
    setList((prev) => {
      const newValue = Object.keys(allApis).map((chainName, index) => {
        const query = queries[index];
        const data = query.data;

        return {
          chain: chainName,
          isFetched: query.isFetched,
          isFetching: query.isFetching,
          isError: query.isError,
          refetch: query.refetch,
          data: data
        };
      });

      return isEqual(prev, newValue) ? prev : newValue;
    });
  }, [queries, allApis]);

  return list;
}

/**
 * Hook to calculate total USD value and 24h change for all assets
 * Optimized to only query assets that have price information
 * @param address - Account address to calculate total USD for
 * @returns [total, change24h] - Total USD value and 24h percentage change
 */
export function useBalanceTotalUsd(address?: string): [number, number] {
  // Only fetch assets with price for performance optimization
  const allChainBalances = useAllChainBalances(address, { onlyWithPrice: true });

  return useMemo(() => {
    let total = 0;
    let lastTotal = 0;

    for (const chainBalance of allChainBalances) {
      if (chainBalance.data) {
        for (const asset of chainBalance.data) {
          // Only process assets with price information
          if (asset.price && asset.price > 0) {
            // Convert balance to decimal and multiply by price
            const assetValue = (Number(asset.total) / Math.pow(10, asset.decimals)) * asset.price;

            total += assetValue;

            // Calculate previous value for 24h change
            // If priceChange exists, calculate what the value was 24h ago
            const previousPrice = asset.priceChange ? asset.price / (1 + asset.priceChange) : asset.price;

            lastTotal += (Number(asset.total) / Math.pow(10, asset.decimals)) * previousPrice;
          }
        }
      }
    }

    // Calculate 24h percentage change
    const changes = lastTotal > 0 ? (total - lastTotal) / lastTotal : 0;

    return [total, changes];
  }, [allChainBalances]);
}

/**
 * Hook to get balance for a specific asset by identifier using direct API call
 * @param network - Network name (e.g., 'polkadot', 'assethub-polkadot')
 * @param address - Account address to query balance for
 * @param identifier - Asset identifier ('native' | HexString | string)
 * @returns [data, isFetched, isFetching] - Asset balance with asset info
 */
export function useBalanceByIdentifier(
  network?: string,
  address?: string,
  identifier?: 'native' | HexString | string | null
): [AccountEnhancedAssetBalance | undefined, boolean, boolean] {
  const { allApis } = useApi();
  const addressHex = useMemo(() => (address ? addressToHex(address) : ''), [address]);
  const api = network ? allApis[network] : undefined;

  // Get asset information first
  const [assetInfo, isAssetFetched, isAssetFetching] = useXcmAsset(network, identifier);

  // Query single asset balance directly
  const { data, isFetched, isFetching } = useQuery({
    queryKey: ['single-asset-balance', network, addressHex, identifier],
    queryFn: async (): Promise<AccountEnhancedAssetBalance | null> => {
      if (!api?.api || !api.isApiReady || !address || !assetInfo) {
        throw new Error('API, address, and asset info are required');
      }

      return fetchSingleAssetBalance(api.api, addressHex as HexString, assetInfo);
    },
    enabled: !!api?.api && !!api.isApiReady && !!address && !!network && !!identifier && !!assetInfo && isAssetFetched,
    staleTime: 12_000,
    refetchInterval: 12_000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    structuralSharing: (prev, next) => {
      return isEqual(prev, next) ? prev : next;
    }
  });

  // Combined fetching state - consider both asset info and balance fetching
  const combinedIsFetched = isAssetFetched && isFetched;
  const combinedIsFetching = isAssetFetching || isFetching;

  return [data || undefined, combinedIsFetched, combinedIsFetching];
}
