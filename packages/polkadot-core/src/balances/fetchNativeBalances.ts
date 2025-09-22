// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { HexString } from '@polkadot/util/types';
import type { BalanceResult } from './types.js';

import { BN_ZERO } from '@polkadot/util';

/**
 * Fetch native token balance for an account
 * @param api - Connected ApiPromise instance
 * @param address - Account address to query
 * @returns Promise<BalanceResult | null> - Balance result or null if zero balance
 */
export async function fetchNativeBalances(api: ApiPromise, address: HexString): Promise<BalanceResult | null> {
  if (!api?.isConnected) {
    throw new Error('API is not connected');
  }

  try {
    const account = await api.query.system.account(address);
    const total = account.data.free.add(account.data.reserved);
    const free = account.data.free;
    const reserved = account.data.reserved;
    const locked = account.data.frozen;

    // Calculate transferrable balance (free - max(frozen - reserved, 0))
    const transferrable = free.sub(locked.gt(reserved) ? locked.sub(reserved) : BN_ZERO);

    return {
      key: 'native',
      total: BigInt(total.toString()),
      locked: BigInt(locked.toString()),
      reserved: BigInt(reserved.toString()),
      free: BigInt(free.toString()),
      transferrable: BigInt(transferrable.toString())
    };
  } catch (error) {
    throw new Error(`Failed to fetch native balance: ${(error as Error).message}`);
  }
}
