// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { HexString } from '@polkadot/util/types';
import type { BalanceResult } from './types.js';

import { BN_ZERO } from '@polkadot/util';

/**
 * Fetch token balances for chains using orml-tokens pallet
 * @param api - Connected ApiPromise instance
 * @param address - Account address to query
 * @returns Promise<BalanceResult[]> - Array of balance results for non-zero balances
 */
export async function fetchTokenBalances(api: ApiPromise, address: HexString): Promise<BalanceResult[]> {
  if (!api?.isConnected) {
    throw new Error('API is not connected');
  }

  if (!api.query.tokens?.accounts) {
    throw new Error('tokens.accounts pallet not available');
  }

  try {
    const entries = await api.query.tokens.accounts.entries(address);
    const results: BalanceResult[] = [];

    for (const [key, data] of entries) {
      const currencyIdHex = key.args[1].toHex();
      const balance = data as any;
      const totalBalance = balance.free.add(balance.reserved);
      const free = balance.free;
      const reserved = balance.reserved;
      const frozen = balance.frozen;

      // Calculate transferrable balance (free - max(frozen - reserved, 0))
      const transferrable = free.sub(frozen.gt(reserved) ? frozen.sub(reserved) : BN_ZERO);

      results.push({
        key: currencyIdHex,
        total: BigInt(totalBalance.toString()),
        locked: BigInt(frozen.toString()),
        reserved: BigInt(reserved.toString()),
        free: BigInt(free.toString()),
        transferrable: BigInt(transferrable.toString())
      });
    }

    return results;
  } catch (error) {
    throw new Error(`Failed to fetch token balances: ${(error as Error).message}`);
  }
}
