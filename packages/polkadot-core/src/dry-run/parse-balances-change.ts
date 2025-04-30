// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Event } from '@polkadot/types/interfaces';

import { encodeAddress } from '../defaults.js';

const zeroAddress = encodeAddress('0x0000000000000000000000000000000000000000000000000000000000000000', 42);

export function parseBalancesChange(events: Event[]) {
  const changes: {
    assetId: 'native' | string;
    from: string;
    to: string;
    amount: bigint;
  }[] = [];

  for (const event of events) {
    if (event.section === 'balances' && event.method === 'Transfer') {
      changes.push({
        assetId: 'native',
        from: event.data[0].toString(),
        to: event.data[1].toString(),
        amount: BigInt(event.data[2].toString())
      });
    }

    if (event.section === 'balances' && event.method === 'Burned') {
      changes.push({
        assetId: 'native',
        from: event.data[0].toString(),
        to: zeroAddress,
        amount: BigInt(event.data[1].toString())
      });
    }

    if (event.section === 'balances' && event.method === 'Minted') {
      changes.push({
        assetId: 'native',
        from: zeroAddress,
        to: event.data[0].toString(),
        amount: BigInt(event.data[1].toString())
      });
    }

    if (event.section === 'balances' && event.method === 'Deposit') {
      changes.push({
        assetId: event.data[0].toHex(),
        from: zeroAddress,
        to: event.data[1].toString(),
        amount: BigInt(event.data[2].toString())
      });
    }

    if (event.section === 'balances' && event.method === 'Withdraw') {
      changes.push({
        assetId: event.data[0].toHex(),
        from: event.data[1].toString(),
        to: zeroAddress,
        amount: BigInt(event.data[2].toString())
      });
    }

    if (event.section === 'assets' && event.method === 'Transferred') {
      changes.push({
        assetId: event.data[0].toString(),
        from: event.data[1].toString(),
        to: event.data[2].toString(),
        amount: BigInt(event.data[3].toString())
      });
    }

    if (event.section === 'assets' && event.method === 'Burned') {
      changes.push({
        assetId: event.data[0].toString(),
        from: event.data[1].toString(),
        to: zeroAddress,
        amount: BigInt(event.data[2].toString())
      });
    }

    if (event.section === 'assets' && event.method === 'Issued') {
      changes.push({
        assetId: event.data[0].toString(),
        from: zeroAddress,
        to: event.data[1].toString(),
        amount: BigInt(event.data[2].toString())
      });
    }

    if (event.section === 'assets' && event.method === 'Deposited') {
      changes.push({
        assetId: event.data[0].toHex(),
        from: zeroAddress,
        to: event.data[1].toString(),
        amount: BigInt(event.data[2].toString())
      });
    }

    if (event.section === 'assets' && event.method === 'Withdrawn') {
      changes.push({
        assetId: event.data[0].toHex(),
        from: event.data[1].toString(),
        to: zeroAddress,
        amount: BigInt(event.data[2].toString())
      });
    }

    if (event.section === 'foreignAssets' && event.method === 'Transferred') {
      changes.push({
        assetId: event.data[0].toHex(),
        from: event.data[1].toString(),
        to: event.data[2].toString(),
        amount: BigInt(event.data[3].toString())
      });
    }

    if (event.section === 'foreignAssets' && event.method === 'Burned') {
      changes.push({
        assetId: event.data[0].toHex(),
        from: event.data[1].toString(),
        to: zeroAddress,
        amount: BigInt(event.data[2].toString())
      });
    }

    if (event.section === 'foreignAssets' && event.method === 'Issued') {
      changes.push({
        assetId: event.data[0].toHex(),
        from: zeroAddress,
        to: event.data[1].toString(),
        amount: BigInt(event.data[2].toString())
      });
    }

    if (event.section === 'foreignAssets' && event.method === 'Deposited') {
      changes.push({
        assetId: event.data[0].toHex(),
        from: zeroAddress,
        to: event.data[1].toString(),
        amount: BigInt(event.data[2].toString())
      });
    }

    if (event.section === 'foreignAssets' && event.method === 'Withdrawn') {
      changes.push({
        assetId: event.data[0].toHex(),
        from: event.data[1].toString(),
        to: zeroAddress,
        amount: BigInt(event.data[2].toString())
      });
    }

    if (event.section === 'tokens' && event.method === 'Transfer') {
      changes.push({
        assetId: event.data[0].toHex(),
        from: event.data[1].toString(),
        to: event.data[2].toString(),
        amount: BigInt(event.data[3].toString())
      });
    }

    if (event.section === 'tokens' && event.method === 'Deposited') {
      changes.push({
        assetId: event.data[0].toHex(),
        from: zeroAddress,
        to: event.data[1].toString(),
        amount: BigInt(event.data[2].toString())
      });
    }

    if (event.section === 'tokens' && event.method === 'Withdrawn') {
      changes.push({
        assetId: event.data[0].toHex(),
        from: event.data[1].toString(),
        to: zeroAddress,
        amount: BigInt(event.data[2].toString())
      });
    }
  }

  return changes;
}
