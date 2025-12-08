// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { CompleteEnhancedAssetInfo } from '@mimir-wallet/service';

import { ApiManager, getFeeAssetLocation } from '@mimir-wallet/polkadot-core';
import { useQuery } from '@mimir-wallet/service';

/**
 * Hook to convert native gas fee to required amount in target asset
 * @param network - The network key to use for conversion
 * @param nativeGasFee - The native gas fee amount
 * @param targetAsset - The target asset to convert to
 */
export function useAssetConversion(
  network: string,
  nativeGasFee: bigint | undefined | null,
  targetAsset: CompleteEnhancedAssetInfo | undefined | null,
): bigint | undefined | null {
  // Store nativeGasFee string representation for queryKey
  const nativeGasFeeStr = nativeGasFee?.toString() ?? null;

  const { data: gasFeeData } = useQuery({
    queryKey: [
      'asset-conversion',
      network,
      nativeGasFeeStr,
      targetAsset,
    ] as const,
    queryFn: async ({
      queryKey: [, network, nativeGasFeeStr],
    }): Promise<bigint> => {
      if (!nativeGasFeeStr || !targetAsset) {
        throw new Error('nativeGasFee and targetAsset are required');
      }

      const nativeGasFee = BigInt(nativeGasFeeStr);

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
              getFeeAssetLocation(
                api,
                targetAsset.assetId,
              ) as unknown as string,
              {
                interior: 'Here',
                parents: 1,
              } as unknown as string,
              nativeGasFee,
              true,
            )
          ).toString(),
        );

        return convertedFee;
      } catch (error) {
        console.error('Failed to query gas fee:', error);
        throw error;
      }
    },
    enabled: !!nativeGasFeeStr && !!targetAsset && !!network,
    staleTime: 30000, // Cache for 30 seconds
    retry: 1,
  });

  return gasFeeData;
}
