// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { AccountId, AccountIndex, Address } from '@polkadot/types/interfaces';
import type { Registry } from '@polkadot/types/types';
import type { Endpoint } from './types.js';

import { TypeRegistry } from '@polkadot/types';
import { isCodec } from '@polkadot/util';
import { decodeAddress as decodeAddressBase, encodeAddress as encodeAddressBase } from '@polkadot/util-crypto';

export const NETWORK_RPC_PREFIX = 'network_rpc:';

export const statics: { api: ApiPromise; registry: Registry; chain: Endpoint } = {
  registry: new TypeRegistry(),
  chain: {} as Endpoint
} as any;

export const DEFAULT_AUX = ['Aux1', 'Aux2', 'Aux3', 'Aux4', 'Aux5', 'Aux6', 'Aux7', 'Aux8', 'Aux9'];

export function encodeAddress(
  key?: AccountId | AccountIndex | Address | string | Uint8Array | null,
  ss58Format = statics.chain.ss58Format
) {
  if (!key) {
    return '';
  }

  return encodeAddressBase(isCodec(key) ? key.toU8a() : key, ss58Format);
}

export function decodeAddress(address: string) {
  return decodeAddressBase(address);
}
