// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { Option } from '@polkadot/types';
import type { PalletAssetsAssetAccount } from '@polkadot/types/lookup';
import type { HexString } from '@polkadot/util/types';
import type { CompleteEnhancedAssetInfo } from '@mimir-wallet/service';
import type { AccountEnhancedAssetBalance } from './types.js';

import { BN_ZERO } from '@polkadot/util';

/**
 * Fetch balance for a single specific asset by its enhanced asset info
 * @param api - Connected ApiPromise instance
 * @param address - Account address to query
 * @param asset - Enhanced asset information containing all necessary metadata
 * @param network - Network name for chain-specific logic (e.g., 'acala', 'karura')
 * @returns Promise<AccountEnhancedAssetBalance | null> - Asset balance with metadata or null if zero balance
 */
export async function fetchSingleAssetBalance(
  api: ApiPromise,
  address: HexString,
  asset: CompleteEnhancedAssetInfo
): Promise<AccountEnhancedAssetBalance | null> {
  if (!api?.isConnected) {
    throw new Error('API is not connected');
  }

  try {
    // Handle native asset
    if (asset.isNative) {
      const account = await api.query.system.account(address);
      const total = account.data.free.add(account.data.reserved);
      const free = account.data.free;
      const reserved = account.data.reserved;
      const locked = account.data.frozen;

      // Calculate transferrable balance (free - max(frozen - reserved, 0))
      const transferrable = free.sub(locked.gt(reserved) ? locked.sub(reserved) : BN_ZERO);

      return {
        ...asset,
        address,
        total: BigInt(total.toString()),
        locked: BigInt(locked.toString()),
        reserved: BigInt(reserved.toString()),
        free: BigInt(free.toString()),
        transferrable: BigInt(transferrable.toString())
      };
    }

    // Handle assets using pallet-assets or pallet-foreign-assets
    if (api.query.assets) {
      const accountData =
        asset.isForeignAsset && api.query.foreignAssets
          ? await (api.query.foreignAssets.account?.(asset.key, address.toString()) as Promise<
              Option<PalletAssetsAssetAccount> | null | undefined
            >)
          : await api.query.assets.account(asset.key, address.toString());

      if (accountData && accountData.isSome) {
        const unwrapped = accountData.unwrap();
        const balance = unwrapped.balance;

        return {
          ...asset,
          address,
          total: BigInt(balance.toString()),
          locked: 0n,
          reserved: 0n,
          free: BigInt(balance.toString()),
          transferrable: BigInt(balance.toString())
        };
      }

      return null;
    }

    // Handle tokens using orml-tokens pallet
    if (api.query.tokens?.accounts) {
      const tokenAccount = await api.query.tokens.accounts(address.toString(), asset.key);
      const balance = tokenAccount as any;
      const totalBalance = balance.free.add(balance.reserved);
      const free = balance.free;
      const reserved = balance.reserved;
      const frozen = balance.frozen;

      // Calculate transferrable balance (free - max(frozen - reserved, 0))
      const transferrable = free.sub(frozen.gt(reserved) ? frozen.sub(reserved) : BN_ZERO);

      return {
        ...asset,
        address,
        total: BigInt(totalBalance.toString()),
        locked: BigInt(frozen.toString()),
        reserved: BigInt(reserved.toString()),
        free: BigInt(free.toString()),
        transferrable: BigInt(transferrable.toString())
      };
    }

    throw new Error('No suitable balance query method available for this asset type');
  } catch (error) {
    throw new Error(`Failed to fetch single asset balance for ${asset.symbol}: ${(error as Error).message}`);
  }
}
