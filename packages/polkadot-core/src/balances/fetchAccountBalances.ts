// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { HexString } from '@polkadot/util/types';
import type { CompleteEnhancedAssetInfo } from '@mimir-wallet/service';
import type { AccountEnhancedAssetBalance, BalanceResult } from './types.js';

import { fetchAssethubBalances } from './fetchAssethubBalances.js';
import { fetchNativeBalances } from './fetchNativeBalances.js';
import { fetchTokenBalances } from './fetchTokenBalances.js';

/**
 * Fetch all account balances for given assets using the appropriate method based on chain type
 * @param api - Connected ApiPromise instance
 * @param address - Account address to query
 * @param assets - Array of enhanced assets to query balances for
 * @param chainName - Name of the chain (for chain-specific logic)
 * @returns Promise<AccountEnhancedAssetBalance[]> - Array of account balances with asset info
 */
export async function fetchAccountBalances(
  api: ApiPromise,
  address: HexString,
  assets: CompleteEnhancedAssetInfo[]
): Promise<AccountEnhancedAssetBalance[]> {
  if (!api?.isConnected) {
    throw new Error('API is not connected');
  }

  const results: AccountEnhancedAssetBalance[] = [];

  try {
    // Create a map of key to asset for efficient lookup
    const assetMap = new Map<string, CompleteEnhancedAssetInfo>();

    for (const asset of assets) {
      if (asset.key) {
        assetMap.set(asset.key, asset);
      }

      // For native assets, use 'native' as key
      if (asset.isNative) {
        assetMap.set('native', asset);
      }
    }

    // Fetch native balance first
    const nativeBalance = await fetchNativeBalances(api, address);

    if (nativeBalance) {
      const nativeAsset = assetMap.get('native');

      if (nativeAsset) {
        results.push({
          ...nativeAsset,
          address,
          total: nativeBalance.total,
          locked: nativeBalance.locked,
          reserved: nativeBalance.reserved,
          free: nativeBalance.free,
          transferrable: nativeBalance.transferrable
        });
      }
    }

    // Fetch non-native balances based on chain type
    let balanceResults: BalanceResult[] = [];

    if ('account' in (api.query?.assets || {})) {
      // AssethubPolkadot and similar chains
      const nonNativeAssets = assets.filter((asset) => !asset.isNative);

      balanceResults = await fetchAssethubBalances(api, address, nonNativeAssets);
    } else if (api.query.tokens) {
      // Chains with orml-tokens
      balanceResults = await fetchTokenBalances(api, address);
    }

    // Map balance results to account balances
    for (const balanceResult of balanceResults) {
      const asset = assetMap.get(balanceResult.key);

      if (asset) {
        results.push({
          ...asset,
          address,
          total: balanceResult.total,
          locked: balanceResult.locked,
          reserved: balanceResult.reserved,
          free: balanceResult.free,
          transferrable: balanceResult.transferrable
        });
      }
    }

    return results;
  } catch (error) {
    throw new Error(`Failed to fetch account balances: ${(error as Error).message}`);
  }
}
