// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { IMethod } from '@polkadot/types/types';

import { createKeyMulti } from '@polkadot/util-crypto';

import { encodeAddress } from './defaults';

export function findTargetCall(
  api: ApiPromise,
  address: string,
  call?: IMethod | null
): [string, IMethod | null | undefined] {
  if (!call) {
    return [address, call];
  }

  if (api.tx.proxy?.proxy.is(call)) {
    return findTargetCall(api, call.args[0].toString(), call.args[2]);
  }

  if (api.tx.proxy?.proxyAnnounced.is(call)) {
    return findTargetCall(api, call.args[1].toString(), call.args[3]);
  }

  // if (api.tx.proxy?.announce.is(call)) {
  //   return findTargetCall(api, call.args[0].toString(), null);
  // }

  if (api.tx.multisig.asMulti.is(call)) {
    return findTargetCall(
      api,
      encodeAddress(createKeyMulti(call.args[1].map((item) => item.toString()).concat(address), call.args[0])),
      call.args[3]
    );
  }

  if (api.tx.multisig.asMultiThreshold1.is(call)) {
    return findTargetCall(
      api,
      encodeAddress(createKeyMulti(call.args[0].map((item) => item.toString()).concat(address), 1)),
      call.args[1]
    );
  }

  // if (api.tx.multisig.approveAsMulti.is(call)) {
  //   return findTargetCall(api, encodeAddress(createKeyMulti(call.args[1], call.args[0])), null);
  // }

  return [address, call];
}
