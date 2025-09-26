// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { CompleteEnhancedAssetInfo } from '@mimir-wallet/service';

import { useMemo, useState } from 'react';

import { useApi } from '@mimir-wallet/polkadot-core';

import { useChainXcmAsset } from './useXcmAssets';

/**
 * Hook to check if the current chain supports custom asset fees
 * This is determined by checking for ChargeAssetTxPayment in signed extensions
 */
export function useCustomGasFeeSupport(): boolean {
  const { api, isApiReady } = useApi();

  return useMemo(() => {
    if (!isApiReady || !api) {
      return false;
    }

    // Check if the chain has ChargeAssetTxPayment signed extension
    return api.registry.signedExtensions.some((ext) => ext === 'ChargeAssetTxPayment');
  }, [api, isApiReady]);
}

/**
 * Hook to manage custom gas fee asset selection
 * Filters assets that can be used for transaction fees
 */
export function useCustomGasFee(network: string) {
  const isSupported = useCustomGasFeeSupport();
  const [assets, isFetched, isFetching] = useChainXcmAsset(network);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);

  // Filter assets that can be used for fees
  // Include native token and local assets (exclude foreignAssets)
  const feeEligibleAssets = useMemo(() => {
    return assets.filter((asset) => {
      return isSupported ? asset.isNative || asset.isSufficient : !!asset.isNative;
    });
  }, [assets, isSupported]);

  // Auto-select native token by default
  useMemo(() => {
    if (feeEligibleAssets.length > 0 && !selectedAssetId) {
      const nativeAsset = feeEligibleAssets.find((asset) => asset.isNative);

      if (nativeAsset) {
        setSelectedAssetId('native');
      }
    }
  }, [feeEligibleAssets, selectedAssetId]);

  return {
    isSupported,
    feeEligibleAssets,
    selectedAssetId,
    setSelectedAssetId,
    isFetched,
    isFetching
  };
}

/**
 * Get the asset ID in the format expected by the transaction
 */
export function getTransactionAssetId(asset: CompleteEnhancedAssetInfo | null): string | null {
  if (!asset) {
    return null;
  }

  // Native token should not have an assetId in the transaction
  if (asset.isNative) {
    return null;
  }

  return asset.assetId || null;
}
