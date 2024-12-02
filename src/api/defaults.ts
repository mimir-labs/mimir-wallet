// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { ApiProps } from './types';

import { decodeAddress as decodeAddressBase, encodeAddress as encodeAddressBase } from '@polkadot/util-crypto';
import React from 'react';

export const DEFAULT_AUX = ['Aux1', 'Aux2', 'Aux3', 'Aux4', 'Aux5', 'Aux6', 'Aux7', 'Aux8', 'Aux9'];

export function encodeAddress(key: string | Uint8Array, ss58Format = window?.currentChain?.ss58Format) {
  return encodeAddressBase(key, ss58Format);
}

export function decodeAddress(address: string) {
  return decodeAddressBase(address);
}

export const ApiCtx = React.createContext<ApiProps>({} as unknown as ApiProps);

export const statics: { api: ApiPromise } = {} as any;
