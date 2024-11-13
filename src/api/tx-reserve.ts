// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { SubmittableExtrinsic } from '@polkadot/api/types';
import type { Option, u128, Vec } from '@polkadot/types';
import type { Call, Multisig } from '@polkadot/types/interfaces';
import type { PalletProxyAnnouncement, PalletProxyProxyDefinition } from '@polkadot/types/lookup';
import type { ITuple } from '@polkadot/types/types';
import type { BN } from '@polkadot/util';

import { encodeMultiAddress } from '@polkadot/util-crypto';

import { addressEq } from '@mimir-wallet/utils';

export async function txReserve(
  api: ApiPromise,
  call: Call,
  address: string,
  reserve: Record<string, { value: BN }> = {},
  unreserve: Record<string, { value: BN }> = {},
  delay: Record<string, BN> = {}
) {
  if (api.tx.multisig?.approveAsMulti.is(call) || api.tx.multisig?.asMulti.is(call)) {
    const threshold = call.args[0];
    const multisigAddress = encodeMultiAddress([address, ...call.args[1]], threshold, api.registry.chainSS58);
    const info = await api.query.multisig.multisigs<Option<Multisig>>(
      multisigAddress,
      api.tx.multisig.approveAsMulti.is(call) ? call.args[3] : call.args[3].hash
    );

    if (info.isSome) {
      const { approvals, depositor, deposit } = info.unwrap();

      if (approvals.length >= threshold.toNumber() - 1) {
        if (api.tx.multisig.asMulti.is(call)) {
          unreserve[depositor.toString()] = { value: deposit };
          await txReserve(api, call.args[3], multisigAddress, reserve, unreserve, delay);
        }
      }
    } else {
      reserve[address] = {
        value: api.consts.multisig.depositBase.add(api.consts.multisig.depositFactor.mul(threshold))
      };
    }
  } else if (api.tx.multisig?.asMultiThreshold1.is(call)) {
    const multisigAddress = encodeMultiAddress([address, ...call.args[0]], 1, api.registry.chainSS58);

    await txReserve(api, call.args[1], multisigAddress, reserve, unreserve, delay);
  } else if (api.tx.multisig?.cancelAsMulti.is(call)) {
    const threshold = call.args[0];
    const multisigAddress = encodeMultiAddress([address, ...call.args[1]], threshold, api.registry.chainSS58);
    const info = await api.query.multisig.multisigs<Option<Multisig>>(multisigAddress, call.args[3]);

    if (info.isSome) {
      const { depositor, deposit } = info.unwrap();

      unreserve[depositor.toString()] = { value: deposit };
    }
  } else if (api.tx.proxy?.announce.is(call)) {
    const real = call.args[0].toString();
    const [announcements, proxies] = await api.queryMulti<
      [ITuple<[Vec<PalletProxyAnnouncement>, u128]>, ITuple<[Vec<PalletProxyProxyDefinition>, u128]>]
    >([
      [api.query.proxy.announcements, address],
      [api.query.proxy.proxies, real]
    ]);

    reserve[address] = {
      value:
        announcements[0].length === 0
          ? api.consts.proxy.announcementDepositBase.add(api.consts.proxy.announcementDepositFactor)
          : api.consts.proxy.announcementDepositFactor
    };

    const proxy = proxies[0].find((item) => addressEq(item.delegate, address) && item.delay.gtn(0));

    if (proxy) {
      delay[real] = proxy.delay;
    }
  } else if (api.tx.proxy?.proxyAnnounced.is(call)) {
    const delegate = call.args[0].toString();
    const real = call.args[1].toString();
    const announcements = await api.query.proxy.announcements(delegate);

    if (announcements[0].length <= 1) {
      unreserve[delegate] = { value: announcements[1] };
    } else {
      unreserve[delegate] = { value: api.consts.proxy.announcementDepositFactor };
    }

    await txReserve(api, call.args[3], real, reserve, unreserve, delay);
  } else if (api.tx.proxy?.removeAnnouncement?.is(call)) {
    const announcements = await api.query.proxy.announcements(address);

    if (announcements[0].length <= 1) {
      unreserve[address] = { value: announcements[1] };
    } else {
      unreserve[address] = { value: api.consts.proxy.announcementDepositFactor };
    }
  } else if (api.tx.proxy?.rejectAnnouncement?.is(call)) {
    const delegate = call.args[0].toString();
    const announcements = await api.query.proxy.announcements(delegate);

    if (announcements[0].length <= 1) {
      unreserve[delegate] = { value: announcements[1] };
    } else {
      unreserve[delegate] = { value: api.consts.proxy.announcementDepositFactor };
    }
  } else if (api.tx.proxy?.createPure?.is(call)) {
    reserve[address] = {
      value: api.consts.proxy.proxyDepositBase.add(api.consts.proxy.proxyDepositFactor)
    };
  } else if (api.tx.proxy?.removeProxy?.is(call)) {
    const proxies = await api.query.proxy.proxies(address);

    if (proxies[0].length <= 1) {
      unreserve[address] = { value: proxies[1] };
    } else {
      unreserve[address] = { value: api.consts.proxy.proxyDepositFactor };
    }
  } else if (api.tx.proxy?.addProxy?.is(call)) {
    const proxies = await api.query.proxy.proxies(address);

    if (proxies[0].length === 0) {
      reserve[address] = {
        value: api.consts.proxy.proxyDepositBase.add(api.consts.proxy.proxyDepositFactor)
      };
    } else {
      reserve[address] = { value: api.consts.proxy.proxyDepositFactor };
    }
  } else if (api.tx.proxy?.removeProxies?.is(call)) {
    const proxies = await api.query.proxy.proxies(address);

    unreserve[address] = { value: proxies[1] };
  } else if (api.tx.proxy?.proxy?.is(call)) {
    await txReserve(api, call.args[2], call.args[0].toString(), reserve, unreserve, delay);
  } else if (api.tx.proxy?.killPure?.is(call)) {
    const address = call.args[0].toString();

    if (unreserve[address]) {
      unreserve[address] = { value: unreserve[address].value.add(api.consts.proxy.proxyDepositBase) };
    } else {
      unreserve[address] = { value: api.consts.proxy.proxyDepositBase };
    }
  }
}

export async function extrinsicReserve(api: ApiPromise, signer: string, tx: SubmittableExtrinsic<'promise'>) {
  const reserve: Record<string, { value: BN }> = {};
  const unreserve: Record<string, { value: BN }> = {};
  const delay: Record<string, BN> = {};

  const call = api.createType('Call', tx.method);

  await txReserve(api, call, signer, reserve, unreserve, delay);

  return { reserve, unreserve, delay };
}
