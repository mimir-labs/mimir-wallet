// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { SubmittableExtrinsic } from '@polkadot/api-base/types';
import type { Timepoint } from '@polkadot/types/interfaces';
import type { IMethod } from '@polkadot/types/types';
import type { HexString } from '@polkadot/util/types';

import {
  addressEq,
  callFilter,
  decodeAddress,
} from '@mimir-wallet/polkadot-core';
import { isString, u8aSorted } from '@polkadot/util';
import { blake2AsHex, blake2AsU8a } from '@polkadot/util-crypto';

import {
  type FilterPath,
  type Transaction,
  TransactionType,
} from '@/hooks/types';

export type TxBundle = { tx: SubmittableExtrinsic<'promise'>; signer: string };

/**
 * Error thrown when attempting to approve a multisig transaction that has already been executed.
 * This typically happens due to a race condition where the UI hasn't refreshed after the final approval.
 */
export class MultisigAlreadyExecutedError extends Error {
  public readonly multisigAddress: string;
  public readonly callHash: string;

  constructor(multisigAddress: string, callHash: string) {
    super(
      `Multisig transaction has already been executed or cancelled. ` +
        `Multisig: ${multisigAddress}, CallHash: ${callHash}`,
    );
    this.name = 'MultisigAlreadyExecutedError';
    this.multisigAddress = multisigAddress;
    this.callHash = callHash;
  }
}

/**
 * Warning info when the on-chain timepoint doesn't match the expected timepoint from the transaction.
 * This indicates the multisig transaction state has changed (e.g., someone else approved).
 */
export interface TimepointMismatchInfo {
  multisigAddress: string;
  expectedHeight: string;
  expectedIndex: number;
  actualHeight: string;
  actualIndex: number;
}

async function asMulti(
  api: ApiPromise,
  tx: SubmittableExtrinsic<'promise'>,
  multisig: string,
  threshold: number,
  otherSignatories: string[],
  expectedTimepoint?: { height: string; index: number },
): Promise<{
  tx: SubmittableExtrinsic<'promise'>;
  timepointMismatch?: TimepointMismatchInfo;
}> {
  const u8a = api.tx(tx.toU8a()).toU8a();

  const [info, { weight }] = await Promise.all([
    // IMPORTANT: the hash is used to identify the multisig transaction
    api.query.multisig.multisigs(multisig, blake2AsU8a(tx.method.toU8a())),
    api.call.transactionPaymentApi.queryInfo(u8a, u8a.length),
  ]);

  let timepoint: Timepoint | null = null;
  let timepointMismatch: TimepointMismatchInfo | undefined;

  if (info.isSome) {
    timepoint = info.unwrap().when;

    // Check if timepoint matches expected
    if (expectedTimepoint) {
      const actualHeight = timepoint.height.toString();
      const actualIndex = timepoint.index.toNumber();

      if (
        actualHeight !== expectedTimepoint.height ||
        actualIndex !== expectedTimepoint.index
      ) {
        timepointMismatch = {
          multisigAddress: multisig,
          expectedHeight: expectedTimepoint.height,
          expectedIndex: expectedTimepoint.index,
          actualHeight,
          actualIndex,
        };
      }
    }
  } else if (expectedTimepoint) {
    // Race condition detected: user expects to approve but multisig already executed
    throw new MultisigAlreadyExecutedError(
      multisig,
      blake2AsHex(tx.method.toU8a()),
    );
  }

  if (threshold === 1 && api.tx.multisig.asMultiThreshold1) {
    return {
      tx: api.tx.multisig.asMultiThreshold1(
        u8aSorted(otherSignatories.map((address) => decodeAddress(address))),
        tx.method.toU8a(),
      ),
      timepointMismatch,
    };
  }

  const resultTx =
    api.tx.multisig.asMulti.meta.args.length === 6
      ? (api.tx.multisig.asMulti as any)(
          threshold,
          u8aSorted(otherSignatories.map((address) => decodeAddress(address))),
          timepoint,
          tx.method.toU8a(),
          false,
          weight,
        )
      : api.tx.multisig.asMulti(
          threshold,
          u8aSorted(otherSignatories.map((address) => decodeAddress(address))),
          timepoint,
          tx.method.toU8a(),
          weight,
        );

  return { tx: resultTx, timepointMismatch };
}

async function announce(
  api: ApiPromise,
  tx: SubmittableExtrinsic<'promise'>,
  proxy: string,
  delegate: string,
  delay: number,
) {
  const proxies = await api.query.proxy.proxies(proxy);
  const exists = proxies[0].filter((item) =>
    addressEq(item.delegate.toString(), delegate),
  );

  if (!exists.length) {
    throw new Error('Proxy not found');
  }

  if (!exists.find((item) => item.delay.toNumber() === delay)) {
    throw new Error('Proxy delay mismatch');
  }

  if (!api.tx.proxy?.announce) {
    throw new Error(
      `${api.runtimeChain.toString()} does not support proxy announce`,
    );
  }

  return api.tx.proxy.announce(proxy, tx.method.hash);
}

async function proxy(
  api: ApiPromise,
  tx: SubmittableExtrinsic<'promise'>,
  proxy: string,
  delegate: string,
  proxyType: string,
  call?: HexString | null,
) {
  const proxies = await api.query.proxy.proxies(proxy);

  const exists = proxies[0].find((item) =>
    addressEq(item.delegate.toString(), delegate),
  );

  if (!exists) {
    if (!api.tx.remoteProxyRelayChain)
      throw new Error(`Proxy not exists on account ${proxy}`);

    return call
      ? api.tx(api.registry.createType('Call', call))
      : api.tx.remoteProxyRelayChain.remoteProxyWithRegisteredProof(
          proxy,
          proxyType,
          tx.method.toU8a(),
        );
  }

  if (call) {
    return api.tx(api.registry.createType('Call', call));
  } else {
    return api.tx.proxy.proxy(proxy, proxyType as any, tx.method.toU8a());
  }
}

export type TxBundleWithWarning = TxBundle & {
  timepointMismatch?: TimepointMismatchInfo;
};

export function buildTx(
  api: ApiPromise,
  call: IMethod,
  path: [FilterPath, ...FilterPath[]],
  transaction?: Transaction | null,
  calls?: Set<HexString>,
): Promise<TxBundleWithWarning>;
export function buildTx(
  api: ApiPromise,
  call: IMethod,
  account: string,
  transaction?: Transaction | null,
  calls?: Set<HexString>,
): Promise<TxBundleWithWarning>;

export async function buildTx(
  api: ApiPromise,
  call: IMethod,
  pathOrAccount: [FilterPath, ...FilterPath[]] | string,
  transaction?: Transaction | null,
  calls: Set<HexString> = new Set(),
): Promise<TxBundleWithWarning> {
  const functionMeta = api.registry.findMetaCall(call.callIndex);

  let tx = api.tx[functionMeta.section][functionMeta.method](...call.args);

  if (isString(pathOrAccount)) {
    return { tx, signer: pathOrAccount };
  }

  const path = pathOrAccount;

  let _transaction = transaction;
  let timepointMismatch: TimepointMismatchInfo | undefined;

  for (const item of path) {
    if (item.type === 'multisig') {
      // Extract expected timepoint from transaction for validation
      let expectedTimepoint: { height: string; index: number } | undefined;

      if (
        _transaction &&
        _transaction.type === TransactionType.Multisig &&
        _transaction.height !== undefined &&
        _transaction.index !== undefined
      ) {
        expectedTimepoint = {
          height: _transaction.height,
          index: _transaction.index,
        };
      }

      const result = await asMulti(
        api,
        tx,
        item.multisig,
        item.threshold,
        item.otherSignatures,
        expectedTimepoint,
      );

      tx = result.tx;

      if (result.timepointMismatch) {
        timepointMismatch = result.timepointMismatch;
      }

      _transaction = _transaction?.children.find(({ address }) =>
        addressEq(address, item.address),
      );
    } else if (item.type === 'proxy') {
      callFilter(api, item.proxyType, item.address, tx.method);

      if (item.delay) {
        calls.add(tx.method.toHex());
        _transaction = _transaction?.children.find(({ address }) =>
          addressEq(address, item.address),
        );

        tx = await announce(api, tx, item.real, item.address, item.delay);
      } else {
        _transaction = _transaction?.children.find(
          ({ address }) =>
            addressEq(address, _transaction?.delegate) &&
            addressEq(address, item.address),
        );

        tx = await proxy(
          api,
          tx,
          item.real,
          _transaction ? _transaction.address : item.address,
          item.proxyType as any,
          _transaction?.call,
        );
      }
    }
  }

  const signer = path[path.length - 1].address;

  return { tx, signer, timepointMismatch };
}
