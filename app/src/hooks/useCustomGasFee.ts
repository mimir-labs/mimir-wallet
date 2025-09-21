// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { CompleteEnhancedAssetInfo } from '@mimir-wallet/service';

import { findToken } from '@/config';
import { isHex } from '@polkadot/util';
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
  const { api, isApiReady } = useApi();
  const [assets, isFetched, isFetching] = useChainXcmAsset(network);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);

  // Create native asset info
  const nativeAsset = useMemo((): CompleteEnhancedAssetInfo | null => {
    if (!api || !isApiReady) {
      return null;
    }

    const symbol = api.registry.chainTokens[0].toString();
    const decimals = api.registry.chainDecimals[0];
    const genesisHash = api.genesisHash.toHex();

    return {
      name: symbol,
      symbol: symbol,
      decimals: decimals,
      existentialDeposit: api.consts.balances.existentialDeposit.toString(),
      logoUri: findToken(genesisHash).Icon,
      isNative: true,
      price: 0,
      priceChange: 0,
      isSufficient: true
    };
  }, [api, isApiReady]);

  // Filter assets that can be used for fees
  // Include native token and local assets (exclude foreignAssets)
  const feeEligibleAssets = useMemo(() => {
    const eligibleAssets: CompleteEnhancedAssetInfo[] = [];

    // Always include native token first
    if (nativeAsset) {
      eligibleAssets.push(nativeAsset);
    }

    if (!isSupported) {
      return eligibleAssets;
    }

    // Add local assets (exclude foreignAssets)
    if (assets) {
      const localAssets = assets.filter((asset) => {
        // Exclude foreignAssets (identified by hex assetId)
        if (isHex(asset.assetId)) {
          return false;
        }

        // For local assets, include those marked as sufficient
        return asset.isSufficient === true;
      });

      eligibleAssets.push(...localAssets);
    }

    return eligibleAssets;
  }, [assets, isSupported, nativeAsset]);

  // Get the currently selected asset info
  const selectedAsset = useMemo(() => {
    if (!selectedAssetId) {
      return null;
    }

    return (
      feeEligibleAssets.find((asset) =>
        asset.isNative ? selectedAssetId === 'native' : asset.assetId === selectedAssetId
      ) || null
    );
  }, [selectedAssetId, feeEligibleAssets]);

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
    selectedAsset,
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
