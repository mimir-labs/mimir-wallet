// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { Option } from '@polkadot/types';
import type { PalletAssetsAssetAccount } from '@polkadot/types/lookup';
import type { HexString } from '@polkadot/util/types';
import type { AssetInfo, EnhancedAssetInfo, ForeignAssetInfo } from '@mimir-wallet/service';
import type { BalanceResult } from './types.js';

/**
 * Fetch asset balances for AssethubPolkadot and similar chains
 * @param api - Connected ApiPromise instance
 * @param address - Account address to query
 * @param assets - Array of assets to query balances for
 * @returns Promise<BalanceResult[]> - Array of balance results for non-zero balances
 */
export async function fetchAssethubBalances(
  api: ApiPromise,
  address: HexString,
  assets: ((AssetInfo & EnhancedAssetInfo) | (ForeignAssetInfo & EnhancedAssetInfo))[]
): Promise<BalanceResult[]> {
  if (!api?.isConnected) {
    throw new Error('API is not connected');
  }

  if (!api.query.assets) {
    throw new Error('Neither assets nor foreignAssets pallet available');
  }

  // Filter out native assets and prepare query data
  const assetsToQuery = assets.filter((asset) => !asset.isNative);

  if (assetsToQuery.length === 0) {
    return [];
  }

  // Create concurrent queries for all assets
  const queries = assetsToQuery.map(async (asset) => {
    try {
      const queryId = asset.key;

      const accountData = asset.isForeignAsset
        ? await (api.query.foreignAssets?.account?.(queryId, address.toString()) as Promise<
            Option<PalletAssetsAssetAccount> | null | undefined
          >)
        : await api.query.assets?.account(queryId, address.toString());

      if (accountData && accountData.isSome) {
        const unwrapped = accountData.unwrap();
        const balance = unwrapped.balance;

        // For asset balances, typically there's no separate locked/reserved/frozen tracking
        // The balance represents the free amount that can be transferred
        return {
          key: queryId,
          total: BigInt(balance.toString()),
          locked: 0n,
          reserved: 0n,
          free: BigInt(balance.toString()),
          transferrable: BigInt(balance.toString())
        };
      }

      return null;
    } catch (error) {
      // Log error but continue with other assets
      console.warn(`Failed to fetch balance for asset ${asset.symbol}:`, error);

      return null;
    }
  });

  // Execute all queries concurrently and filter out null results
  const queryResults = await Promise.all(queries);

  return queryResults.filter((result) => result !== null) as BalanceResult[];
}
