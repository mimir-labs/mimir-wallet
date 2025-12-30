// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

/**
 * XCM Asset Hooks
 *
 * This module provides hooks for fetching and managing XCM (Cross-Consensus Messaging)
 * asset information across different Polkadot ecosystem chains.
 *
 * Architecture:
 * - useXcmAsset: Fetch single asset by chain + identifier (for specific asset queries)
 * - useAllXcmAsset: Fetch all assets for all chains (cached globally, 10min refresh)
 * - useChainXcmAsset: Get assets for specific chain from global cache (derived from useAllXcmAsset)
 *
 * Data Enhancement:
 * - Local icons are prioritized over remote icons from API
 * - Asset locations are normalized using ParaSpell's getAssetLocation for XCM compatibility
 */

import type { HexString } from '@polkadot/util/types';

import {
  allEndpoints,
  getAssetLocation,
  getAssets,
  getChainIcon,
  useChain,
} from '@mimir-wallet/polkadot-core';
import {
  type CompleteEnhancedAssetInfo,
  service,
  useQuery,
} from '@mimir-wallet/service';
import { isEqual } from 'lodash-es';

import { findAsset } from '@/config/tokens';

/**
 * Generate React Query key for single XCM asset query
 * Used for cache invalidation and deduplication
 */
export const queryXcmAssetKey = (chain: string, identifier: string) => [
  'query-xcm-asset',
  chain,
  identifier,
];

/**
 * Enhance asset with local icon and normalize XCM location
 *
 * Processing Steps:
 * 1. Icon Resolution (local config priority over remote API)
 *    - Native token: from polkadot-core chain config
 *    - Non-native: from local tokens.ts config
 * 2. Location Normalization (for XCM compatibility)
 *    - Use ParaSpell's getAssetLocation to standardize format
 *    - Set to undefined if chain doesn't support XCM or location invalid
 *
 * @param asset - Raw asset data from API
 * @param network - Chain key
 * @param paraspellChain - ParaSpell chain identifier (undefined if chain doesn't support XCM)
 */
function enhanceAsset(
  asset: CompleteEnhancedAssetInfo,
  network: string,
  paraspellChain?: string,
): CompleteEnhancedAssetInfo {
  // Step 1: Resolve local icon
  let localIcon: string | undefined;

  if (asset.isNative) {
    // Native token: get icon from chain config in polkadot-core
    const chainInfo = getChainIcon(network);

    localIcon = chainInfo?.tokenIcon;
  } else {
    // Non-native asset: lookup icon from local tokens config
    const identifier = asset.assetId || asset.key;
    const assetConfig = findAsset(network, identifier);

    localIcon = assetConfig?.Icon;
  }

  // Step 2: Normalize XCM location
  let normalizedLocation = asset.location;

  if (!paraspellChain) {
    // Chain doesn't support XCM
    normalizedLocation = undefined;
  } else if (asset.location) {
    try {
      // Use ParaSpell to get standardized XCM location format
      // Cast paraspellChain to any since it comes from our config and is guaranteed valid
      const paraspellLocation = getAssetLocation(paraspellChain as any, {
        location: asset.location as any,
      });

      normalizedLocation = paraspellLocation || undefined;
    } catch {
      // Invalid location format - mark as non-XCM asset
      normalizedLocation = undefined;
    }
  } else if (asset.isNative) {
    normalizedLocation = getAssets(paraspellChain as any).find(
      (item) => item.isNative,
    )?.location;
  }

  return {
    ...asset,
    logoUri: localIcon || asset.logoUri,
    location: normalizedLocation,
  };
}

/**
 * Fetch a single XCM asset by chain and identifier
 *
 * @param chain - Chain key or genesis hash
 * @param identifier - Asset identifier: 'native' for native token, assetId, or asset key
 * @returns [data, isFetched, isFetching] tuple
 *
 * Features:
 * - Supports both chain key and genesis hash for chain identification
 * - 60s cache refresh interval
 * - Deep equality check prevents unnecessary re-renders
 */
export function useXcmAsset(
  chain?: string,
  identifier?: 'native' | HexString | string | null,
): [
  data: CompleteEnhancedAssetInfo | undefined,
  isFetched: boolean,
  isFetching: boolean,
] {
  // Resolve chain key from either chain key or genesis hash
  const chainKey = allEndpoints.find(
    (item) => item.genesisHash === chain || item.key === chain,
  )?.key;

  const { data, isFetched, isFetching } = useQuery({
    queryKey: queryXcmAssetKey(chainKey || '', identifier || ''),
    queryFn: async ({
      queryKey: [, chainKey, identifier],
    }): Promise<CompleteEnhancedAssetInfo> => {
      if (!identifier || !chainKey) {
        throw new Error('identifier is required');
      }

      return service.asset.getXcmAsset(chainKey, identifier).then((data) => {
        if (!data) return data;

        return enhanceAsset(data, chainKey, paraspellChain);
      });
    },
    refetchInterval: 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    enabled: !!chain && !!identifier,
    // Use deep equality to prevent re-renders when data is structurally identical
    structuralSharing: (prev, next) => {
      return isEqual(prev, next) ? prev : next;
    },
  });

  // Get paraspellChain for location normalization
  const paraspellChain = allEndpoints.find(
    (item) => item.genesisHash === chain || item.key === chain,
  )?.paraspellChain;

  return [data, isFetched, isFetching];
}

/**
 * Fetch all XCM assets for all supported chains
 *
 * This is the primary data source for asset listings. It fetches all assets
 * from all chains in a single API call and caches them globally.
 *
 * @returns [data, isFetched, isFetching, promise] tuple
 *
 * Data Processing Pipeline:
 * 1. Fetch all assets from API (10min cache)
 * 2. Enhance each asset with local icon
 * 3. Normalize asset location using ParaSpell's getAssetLocation
 *    - This ensures location format is compatible with XCM transfers
 *    - Assets without valid location will have location set to undefined
 */
export function useAllXcmAsset() {
  const { data, isFetched, isFetching, promise } = useQuery({
    queryKey: ['get-all-xcm-asset'],
    queryFn: () =>
      service.asset.getAllXcmAsset().then((data) => {
        if (!data) return data;

        const enhancedAssets: Record<string, CompleteEnhancedAssetInfo[]> = {};

        for (const [network, assets] of Object.entries(data)) {
          // Get ParaSpell chain identifier for location normalization
          const paraspellChain = allEndpoints.find(
            (item) => item.key === network,
          )?.paraspellChain;

          // Enhance each asset with local icon and normalized location
          enhancedAssets[network] = assets.map((asset) =>
            enhanceAsset(asset, network, paraspellChain),
          );
        }

        return enhancedAssets;
      }),
    refetchInterval: 60 * 10 * 1000, // 10 minutes - asset list changes infrequently
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    structuralSharing: (prev, next) => {
      return isEqual(prev, next) ? prev : next;
    },
  });

  return [data, isFetched, isFetching, promise] as const;
}

/**
 * Get XCM assets for a specific chain
 *
 * This is a derived hook that extracts chain-specific assets from the
 * global useAllXcmAsset cache. It doesn't make additional API calls.
 *
 * @param network - Chain key to get assets for
 * @returns [assets[], isFetched, isFetching, promiseFn] tuple
 *
 * Usage:
 * - Use this when you need assets for a single chain
 * - The data comes from the shared cache, so multiple components
 *   using this hook for different chains won't cause duplicate requests
 */
export function useChainXcmAsset(network: string) {
  // Reuse global cache from useAllXcmAsset
  const [data, isFetched, isFetching, promise] = useAllXcmAsset();
  const chain = useChain(network);
  const chainKey = chain.key;

  // Extract assets for the specific chain from the global data
  return [
    data?.[chainKey] ?? [],
    isFetched,
    isFetching,
    // Promise function for suspense/await patterns
    () => promise.then((data) => data?.[chainKey] ?? []),
  ] as const;
}
