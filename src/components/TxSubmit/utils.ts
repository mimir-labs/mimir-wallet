// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { SubmittableExtrinsic } from '@polkadot/api-base/types';
import type { Timepoint } from '@polkadot/types/interfaces';
import type { IMethod } from '@polkadot/types/types';
import type { HexString } from '@polkadot/util/types';
import type { FilterPath } from '@mimir-wallet/hooks/types';

import { u8aSorted } from '@polkadot/util';

import { decodeAddress } from '@mimir-wallet/api';

export type TxBundle =
  | { canProxyExecute: false; tx: null }
  | { canProxyExecute: true; tx: SubmittableExtrinsic<'promise'> };

async function asMulti(
  api: ApiPromise,
  tx: SubmittableExtrinsic<'promise'>,
  multisig: string,
  threshold: number,
  otherSignatories: string[]
) {
  const [info, { weight }] = await Promise.all([
    api.query.multisig.multisigs(multisig, tx.method.hash),
    tx.paymentInfo(multisig)
  ]);

  let timepoint: Timepoint | null = null;

  if (info.isSome) {
    timepoint = info.unwrap().when;
  }

  return api.tx.multisig.asMulti.meta.args.length === 6
    ? (api.tx.multisig.asMulti as any)(
        threshold,
        u8aSorted(otherSignatories.map((address) => decodeAddress(address))),
        timepoint,
        tx.method,
        false,
        weight
      )
    : api.tx.multisig.asMulti(
        threshold,
        u8aSorted(otherSignatories.map((address) => decodeAddress(address))),
        timepoint,
        tx.method,
        weight
      );
}

function canProxyExecuteCall(api: ApiPromise, proxyType: string, method: IMethod): true | false | 'unknown' {
  const callFunction = api.registry.findMetaCall(method.callIndex);

  const allowedCalls: Record<string, boolean> = {
    Any: true,
    NonTransfer: callFunction.section !== 'balances',
    Staking: callFunction.section === 'staking',
    Governance: callFunction.section === 'democracy' || callFunction.section === 'council',
    CancelProxy:
      callFunction.section === 'proxy' &&
      (callFunction.method === 'removeProxy' || callFunction.method === 'rejectAnnouncement'),
    Auction: callFunction.section === 'auctions',
    NominationPools: callFunction.section === 'nominationPools'
  };

  const allowed = allowedCalls[proxyType];

  if (allowed) {
    return true;
  }

  if (allowed === false) {
    return false;
  }

  return 'unknown';
}

export async function buildTx(
  api: ApiPromise,
  call: IMethod,
  path: FilterPath[],
  calls: Set<HexString> = new Set()
): Promise<TxBundle> {
  const functionMeta = api.registry.findMetaCall(call.callIndex);

  let tx = api.tx[functionMeta.section][functionMeta.method](...call.args);

  for (const item of path) {
    if (item.type === 'multisig') {
      tx = await asMulti(api, tx, item.multisig, item.threshold, item.otherSignatures);
    } else if (item.type === 'proxy') {
      const canExecute = canProxyExecuteCall(api, item.proxyType, tx.method);

      if (!canExecute) {
        return { canProxyExecute: false, tx: null };
      }

      if (item.delay) {
        calls.add(tx.method.toHex());
        tx = api.tx.proxy.announce(item.real, tx.method.hash);
      } else {
        tx = api.tx.proxy.proxy(item.real, item.proxyType as any, tx.method);
      }
    }
  }

  return { canProxyExecute: true, tx };
}
