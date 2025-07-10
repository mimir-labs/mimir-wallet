// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AssetInfo } from './types';

import { getFeeAssetLocation, useApi } from '@mimir-wallet/polkadot-core';
import { useQuery } from '@mimir-wallet/service';

/**
 * Hook to convert native gas fee to required amount in target asset
 * Currently uses fallback calculation, will be updated to use assetConversionApi.quotePriceTokensForExactTokens
 */
export function useAssetConversion(
  nativeGasFee: bigint | undefined | null,
  targetAsset: AssetInfo | undefined | null
): bigint | undefined | null {
  const { api } = useApi();
  const { data: gasFeeData } = useQuery({
    queryKey: [nativeGasFee, targetAsset] as const,
    queryHash: `gas-fee-estimate-${nativeGasFee?.toString()}-${targetAsset?.assetId}`,
    queryFn: async ({ queryKey }) => {
      const [nativeGasFee, targetAsset] = queryKey;

      if (!nativeGasFee || !targetAsset) {
        throw new Error('Extrinsic is not defined');
      }

      if (targetAsset.isNative) {
        return nativeGasFee;
      }

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
    enabled: !!nativeGasFee && !!targetAsset,
    staleTime: 30000, // Cache for 30 seconds
    retry: 1
  });

  return gasFeeData;
}
