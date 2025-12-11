// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { CompleteEnhancedAssetInfo } from '@mimir-wallet/service';

import { ApiManager } from '@mimir-wallet/polkadot-core';
import { useQuery } from '@mimir-wallet/service';
import { useMemo, useState } from 'react';

import { useChainXcmAsset } from './useXcmAssets';

async function fetchCustomGasFeeSupport({
  queryKey,
}: {
  queryKey: readonly [string, string];
}): Promise<boolean> {
  const [, network] = queryKey;

  const api = await ApiManager.getInstance().getApi(network);

  // Check if the chain has ChargeAssetTxPayment signed extension
  return api.registry.signedExtensions.some(
    (ext) => ext === 'ChargeAssetTxPayment',
  );
}

/**
 * Hook to check if a specific chain supports custom asset fees
 * This is determined by checking for ChargeAssetTxPayment in signed extensions
 * @param network - The network key to query
 */
export function useCustomGasFeeSupport(network: string): boolean | undefined {
  const { data } = useQuery({
    queryKey: ['custom-gas-fee-support', network] as const,
    queryFn: fetchCustomGasFeeSupport,
    enabled: !!network,
    staleTime: Infinity, // Support status doesn't change
  });

  return data;
}

/**
 * Hook to manage custom gas fee asset selection
 * Filters assets that can be used for transaction fees
 */
export function useCustomGasFee(network: string) {
  const isSupported = useCustomGasFeeSupport(network);
  const [assets, isFetched, isFetching] = useChainXcmAsset(network);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);

  // Filter assets that can be used for fees
  // Include native token and local assets (exclude foreignAssets)
  const feeEligibleAssets = useMemo(() => {
    return assets.filter((asset) => {
      return isSupported
        ? asset.isNative || (!asset.isForeignAsset && asset.isSufficient)
        : !!asset.isNative;
    });
  }, [assets, isSupported]);

  // Auto-select native token by default
  useMemo(() => {
    if (feeEligibleAssets.length > 0 && !selectedAssetId) {
      const nativeAsset = feeEligibleAssets.find((asset) => asset.isNative);

      if (nativeAsset) {
        queueMicrotask(() => {
          setSelectedAssetId('native');
        });
      }
    }
  }, [feeEligibleAssets, selectedAssetId]);

  return {
    isSupported,
    feeEligibleAssets,
    selectedAssetId,
    setSelectedAssetId,
    isFetched,
    isFetching,
  };
}

/**
 * Get the asset ID in the format expected by the transaction
 */
export function getTransactionAssetId(
  asset: CompleteEnhancedAssetInfo | null,
): string | null {
  if (!asset) {
    return null;
  }

  // Native token should not have an assetId in the transaction
  if (asset.isNative) {
    return null;
  }

  return asset.assetId || null;
}
