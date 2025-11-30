// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { CompleteEnhancedAssetInfo } from '@mimir-wallet/service';

import { ApiManager, getFeeAssetLocation } from '@mimir-wallet/polkadot-core';
import { useQuery } from '@mimir-wallet/service';

/**
 * Generate a unique identifier for an asset to be used in queryKey
 * Uses minimal fields: isNative, key, assetId, isForeignAsset
 */
function getAssetQueryKey(asset: CompleteEnhancedAssetInfo | undefined | null): string | null {
  if (!asset) return null;

  if (asset.isNative) {
    return 'native';
  }

  // For AssetInfo and ForeignAssetInfo, use key as primary identifier
  const parts: string[] = [];

  if (asset.key) {
    parts.push(asset.key);
  }

  if (asset.assetId) {
    parts.push(asset.assetId);
  }

  if (asset.isForeignAsset) {
    parts.push('foreign');
  }

  return parts.join(':') || null;
}

/**
 * Hook to convert native gas fee to required amount in target asset
 * @param network - The network key to use for conversion
 * @param nativeGasFee - The native gas fee amount
 * @param targetAsset - The target asset to convert to
 */
export function useAssetConversion(
  network: string,
  nativeGasFee: bigint | undefined | null,
  targetAsset: CompleteEnhancedAssetInfo | undefined | null
): bigint | undefined | null {
  // Convert bigint to string for queryKey, and extract asset identifier
  const nativeGasFeeStr = nativeGasFee?.toString() ?? null;
  const targetAssetKey = getAssetQueryKey(targetAsset);

  const { data: gasFeeData } = useQuery({
    queryKey: ['asset-conversion', network, nativeGasFeeStr, targetAssetKey] as const,
    queryFn: async (): Promise<bigint> => {
      if (!nativeGasFee || !targetAsset) {
        throw new Error('nativeGasFee and targetAsset are required');
      }

      // If target asset is native, no conversion needed
      if (targetAsset.isNative) {
        return nativeGasFee;
      }

      const api = await ApiManager.getInstance().getApi(network);

      if (!api.call.assetConversionApi.quotePriceTokensForExactTokens) {
        throw new Error('Asset conversion API not available');
      }

      try {
        const convertedFee = BigInt(
          (
            await api.call.assetConversionApi.quotePriceTokensForExactTokens(
              getFeeAssetLocation(api, targetAsset.assetId) as unknown as string,
              {
                interior: 'Here',
                parents: 1
              } as unknown as string,
              nativeGasFee,
              true
            )
          ).toString()
        );

        return convertedFee;
      } catch (error) {
        console.error('Failed to query gas fee:', error);
        throw error;
      }
    },
    enabled: !!nativeGasFee && !!targetAsset && !!network,
    staleTime: 30000, // Cache for 30 seconds
    retry: 1
  });

  return gasFeeData;
}
