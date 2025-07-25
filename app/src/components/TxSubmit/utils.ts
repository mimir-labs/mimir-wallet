// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { FilterPath, Transaction } from '@/hooks/types';
import type { ApiPromise } from '@polkadot/api';
import type { SubmittableExtrinsic } from '@polkadot/api-base/types';
import type { Timepoint } from '@polkadot/types/interfaces';
import type { IMethod } from '@polkadot/types/types';
import type { HexString } from '@polkadot/util/types';

import { isString, u8aSorted } from '@polkadot/util';
import { blake2AsU8a } from '@polkadot/util-crypto';

import { addressEq, callFilter, decodeAddress } from '@mimir-wallet/polkadot-core';

export type TxBundle = { tx: SubmittableExtrinsic<'promise'>; signer: string };

async function asMulti(
  api: ApiPromise,
  tx: SubmittableExtrinsic<'promise'>,
  multisig: string,
  threshold: number,
  otherSignatories: string[]
) {
  const u8a = api.tx(tx.toU8a()).toU8a();

  const [info, { weight }] = await Promise.all([
    // IMPORTANT: the hash is used to identify the multisig transaction
    api.query.multisig.multisigs(multisig, blake2AsU8a(tx.method.toU8a())),
    api.call.transactionPaymentApi.queryInfo(u8a, u8a.length)
  ]);

  let timepoint: Timepoint | null = null;

  if (info.isSome) {
    timepoint = info.unwrap().when;
  }

  if (threshold === 1 && api.tx.multisig.asMultiThreshold1) {
    return api.tx.multisig.asMultiThreshold1(
      u8aSorted(otherSignatories.map((address) => decodeAddress(address))),
      tx.method.toU8a()
    );
  }

  return api.tx.multisig.asMulti.meta.args.length === 6
    ? (api.tx.multisig.asMulti as any)(
        threshold,
        u8aSorted(otherSignatories.map((address) => decodeAddress(address))),
        timepoint,
        tx.method.toU8a(),
        false,
        weight
      )
    : api.tx.multisig.asMulti(
        threshold,
        u8aSorted(otherSignatories.map((address) => decodeAddress(address))),
        timepoint,
        tx.method.toU8a(),
        weight
      );
}

async function announce(
  api: ApiPromise,
  tx: SubmittableExtrinsic<'promise'>,
  proxy: string,
  delegate: string,
  delay: number
) {
  const proxies = await api.query.proxy.proxies(proxy);
  const exists = proxies[0].filter((item) => addressEq(item.delegate.toString(), delegate));

  if (!exists.length) {
    throw new Error('Proxy not found');
  }

  if (!exists.find((item) => item.delay.toNumber() === delay)) {
    throw new Error('Proxy delay mismatch');
  }

  if (!api.tx.proxy?.announce) {
    throw new Error(`${api.runtimeChain.toString()} does not support proxy announce`);
  }

  return api.tx.proxy.announce(proxy, tx.method.hash);
}

async function proxy(
  api: ApiPromise,
  tx: SubmittableExtrinsic<'promise'>,
  proxy: string,
  delegate: string,
  proxyType: string,
  call?: HexString | null
) {
  const proxies = await api.query.proxy.proxies(proxy);

  const exists = proxies[0].find((item) => addressEq(item.delegate.toString(), delegate));

  if (!exists) {
    if (!api.tx.remoteProxyRelayChain) throw new Error(`Proxy not exists on account ${proxy}`);

    return call
      ? api.tx(api.registry.createType('Call', call))
      : api.tx.remoteProxyRelayChain.remoteProxyWithRegisteredProof(proxy, proxyType, tx.method.toU8a());
  }

  if (call) {
    return api.tx(api.registry.createType('Call', call));
  } else {
    return api.tx.proxy.proxy(proxy, proxyType as any, tx.method.toU8a());
  }
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
        _transaction = _transaction?.children.find(({ address }) => addressEq(address, item.address));

        tx = await announce(api, tx, item.real, item.address, item.delay);
      } else {
        _transaction = _transaction?.children.find(
          ({ address }) => addressEq(address, _transaction?.delegate) && addressEq(address, item.address)
        );

        tx = await proxy(
          api,
          tx,
          item.real,
          _transaction ? _transaction.address : item.address,
          item.proxyType as any,
          _transaction?.call
        );
      }
    }
  }

  const signer = path[path.length - 1].address;

  return { tx, signer };
}
