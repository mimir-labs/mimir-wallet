// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { SubmittableExtrinsic } from '@polkadot/api/promise/types';
import type { Option } from '@polkadot/types';
import type { Multisig, Timepoint } from '@polkadot/types/interfaces';

import keyring from '@polkadot/ui-keyring';
import { BN, u8aSorted } from '@polkadot/util';
import { decodeAddress, encodeMultiAddress } from '@polkadot/util-crypto';

import { getAddressMeta } from './address';

export type PrepareMultisig = [extrinsic: SubmittableExtrinsic, signer: string, reserve: Record<string, BN>, unreserve: Record<string, BN>];

export function canSendMultisig(accounts: Record<string, string | undefined>, address: string): boolean {
  const meta = getAddressMeta(address);

  if (meta.isMultisig) {
    const sender = accounts[address];

    if (!sender) return false;

    return canSendMultisig(accounts, sender);
  } else {
    return !!keyring.getAccount(address);
  }
}

async function _asMulti(api: ApiPromise, extrinsic: SubmittableExtrinsic, threshold: number, who: string[], sender: string, reserve: Record<string, BN>, unreserve: Record<string, BN>) {
  const multiAddress = encodeMultiAddress(who, threshold);
  const others = who.filter((w) => w !== sender);
  const [info, { weight }] = await Promise.all([api.query.multisig.multisigs<Option<Multisig>>(multiAddress, extrinsic.method.hash), extrinsic.paymentInfo(multiAddress)]);

  let timepoint: Timepoint | null = null;
  let approvals = 0;

  if (info.isSome) {
    timepoint = info.unwrap().when;
    approvals = info.unwrap().approvals.length;

    if (approvals >= threshold - 1) {
      unreserve[info.unwrap().depositor.toString()] = info.unwrap().deposit;
    }
  } else {
    reserve[sender] = api.consts.multisig.depositBase.add(api.consts.multisig.depositFactor.muln(2));
  }

  return api.tx.multisig.asMulti(threshold, u8aSorted(others.map((address) => decodeAddress(address))), timepoint, extrinsic.method, weight);
}

export async function prepareMultisig(
  api: ApiPromise,
  extrinsic: SubmittableExtrinsic,
  accounts: Record<string, string | undefined>,
  address: string,
  reserve: Record<string, BN> = {},
  unreserve: Record<string, BN> = {}
): Promise<PrepareMultisig> {
  const meta = getAddressMeta(address);

  if (meta.isMultisig && meta.threshold && meta.who) {
    let tx: SubmittableExtrinsic;
    const sender = accounts[address];

    if (!sender) {
      throw new Error('Can not find sender for multisig');
    }

    if (meta.isFlexible) {
      const proxyTx = api.tx.proxy.proxy(address, 'Any', extrinsic.method);

      tx = await _asMulti(api, proxyTx, meta.threshold, meta.who, sender, reserve, unreserve);
    } else {
      tx = await _asMulti(api, extrinsic, meta.threshold, meta.who, sender, reserve, unreserve);
    }

    return prepareMultisig(api, tx, accounts, sender, reserve);
  } else {
    return [extrinsic, address, reserve, unreserve];
  }
}
