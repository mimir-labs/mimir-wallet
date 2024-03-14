// Copyright 2023-2024 dev.mimir authors & contributors
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

async function _asMulti(
  api: ApiPromise,
  extrinsic: SubmittableExtrinsic,
  threshold: number,
  who: string[],
  sender: string,
  isCancelled: boolean,
  reserve: Record<string, BN>,
  unreserve: Record<string, BN>
): Promise<[tx: SubmittableExtrinsic, cancelled: boolean]> {
  const multiAddress = encodeMultiAddress(who, threshold, api.registry.chainSS58);
  const others = who.filter((w) => w !== sender);
  const [info, { weight }] = await Promise.all([api.query.multisig.multisigs<Option<Multisig>>(multiAddress, extrinsic.method.hash), extrinsic.paymentInfo(multiAddress)]);

  let timepoint: Timepoint | null = null;

  if (info.isSome) {
    timepoint = info.unwrap().when;

    const approvals = info.unwrap().approvals;

    if (isCancelled) {
      unreserve[info.unwrap().depositor.toString()] = info.unwrap().deposit;
    } else if (approvals.length >= threshold - 1) {
      unreserve[info.unwrap().depositor.toString()] = info.unwrap().deposit;
    } else {
      Object.keys(reserve).forEach((key) => {
        delete reserve[key];
      });
      Object.keys(unreserve).forEach((key) => {
        delete unreserve[key];
      });
    }
  } else {
    Object.keys(reserve).forEach((key) => {
      delete reserve[key];
    });
    Object.keys(unreserve).forEach((key) => {
      delete unreserve[key];
    });

    if (!isCancelled) {
      reserve[sender] = api.consts.multisig.depositBase.add(api.consts.multisig.depositFactor.muln(threshold));
    }
  }

  if (isCancelled) {
    if (timepoint) {
      return [api.tx.multisig.cancelAsMulti(threshold, u8aSorted(others.map((address) => decodeAddress(address))), timepoint, extrinsic.method.hash), true];
    } else {
      return [api.tx.multisig.asMulti(threshold, u8aSorted(others.map((address) => decodeAddress(address))), timepoint, extrinsic.method, weight), false];
    }
  } else {
    return [api.tx.multisig.asMulti(threshold, u8aSorted(others.map((address) => decodeAddress(address))), timepoint, extrinsic.method, weight), false];
  }
}

export async function prepareMultisig(
  api: ApiPromise,
  extrinsic: SubmittableExtrinsic,
  accounts: Record<string, string | undefined>,
  address: string,
  isCancelled: boolean,
  reserve: Record<string, BN> = {},
  unreserve: Record<string, BN> = {}
): Promise<PrepareMultisig> {
  const meta = getAddressMeta(address);

  if (meta.isMultisig && meta.threshold && meta.who) {
    let tx: SubmittableExtrinsic;
    let cancelled: boolean;
    const sender = accounts[address];

    if (!sender) {
      throw new Error('Can not find sender for multisig');
    }

    if (meta.isFlexible) {
      const proxyTx = api.tx.proxy.proxy(address, 'Any', extrinsic.method);

      [tx, cancelled] = await _asMulti(api, proxyTx, meta.threshold, meta.who, sender, isCancelled, reserve, unreserve);
    } else {
      [tx, cancelled] = await _asMulti(api, extrinsic, meta.threshold, meta.who, sender, isCancelled, reserve, unreserve);
    }

    return prepareMultisig(api, tx, accounts, sender, isCancelled && !cancelled, reserve, unreserve);
  } else {
    return [extrinsic, address, reserve, unreserve];
  }
}
