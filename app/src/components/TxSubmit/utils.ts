// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { FilterPath, Transaction } from '@/hooks/types';
import type { ApiPromise } from '@polkadot/api';
import type { SubmittableExtrinsic } from '@polkadot/api-base/types';
import type { Timepoint } from '@polkadot/types/interfaces';
import type { IMethod } from '@polkadot/types/types';
import type { HexString } from '@polkadot/util/types';

import { callFilter, decodeAddress } from '@/api';
import { addressEq } from '@/utils';
import { isString, u8aSorted } from '@polkadot/util';
import { blake2AsU8a } from '@polkadot/util-crypto';

export type TxBundle = { tx: SubmittableExtrinsic<'promise'>; signer: string };

async function asMulti(
  api: ApiPromise,
  tx: SubmittableExtrinsic<'promise'>,
  multisig: string,
  threshold: number,
  otherSignatories: string[]
) {
  const [info, { weight }] = await Promise.all([
    // IMPORTANT: the hash is used to identify the multisig transaction
    api.query.multisig.multisigs(multisig, blake2AsU8a(tx.method.toU8a())),
    tx.paymentInfo(multisig)
  ]);

  let timepoint: Timepoint | null = null;

  if (info.isSome) {
    timepoint = info.unwrap().when;
  }

  if (threshold === 1 && api.tx.multisig.asMultiThreshold1) {
    return api.tx.multisig.asMultiThreshold1(
      u8aSorted(otherSignatories.map((address) => decodeAddress(address))),
      tx.method
    );
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

export function buildTx(
  api: ApiPromise,
  call: IMethod,
  path: [FilterPath, ...FilterPath[]],
  transaction?: Transaction | null,
  calls?: Set<HexString>
): Promise<TxBundle>;
export function buildTx(
  api: ApiPromise,
  call: IMethod,
  account: string,
  transaction?: Transaction | null,
  calls?: Set<HexString>
): Promise<TxBundle>;

export async function buildTx(
  api: ApiPromise,
  call: IMethod,
  pathOrAccount: [FilterPath, ...FilterPath[]] | string,
  transaction?: Transaction | null,
  calls: Set<HexString> = new Set()
): Promise<TxBundle> {
  const functionMeta = api.registry.findMetaCall(call.callIndex);

  let tx = api.tx[functionMeta.section][functionMeta.method](...call.args);

  if (isString(pathOrAccount)) {
    return { tx, signer: pathOrAccount };
  }

  const path = pathOrAccount;

  let _transaction = transaction;

  for (const item of path) {
    if (item.type === 'multisig') {
      tx = await asMulti(api, tx, item.multisig, item.threshold, item.otherSignatures);
      _transaction = _transaction?.children.find(({ address }) => addressEq(address, item.address));
    } else if (item.type === 'proxy') {
      callFilter(api, item.proxyType, item.address, tx.method);

      if (item.delay) {
        calls.add(tx.method.toHex());
        tx = api.tx.proxy.announce(item.real, tx.method.hash);
        _transaction = _transaction?.children.find(({ address }) => addressEq(address, item.address));
      } else {
        const delegate = _transaction?.delegate;

        _transaction = _transaction?.children.find(
          ({ address }) => addressEq(address, delegate) && addressEq(address, item.address)
        );

        if (_transaction?.call) {
          tx = api.tx(api.registry.createType('Call', _transaction.call));
        } else {
          tx = api.tx.proxy.proxy(item.real, item.proxyType as any, tx.method);
        }
      }
    }
  }

  return { tx, signer: path[path.length - 1].address };
}
