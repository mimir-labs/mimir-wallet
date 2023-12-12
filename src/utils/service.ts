// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { HexString } from '@polkadot/util/types';

import { api } from '@mimirdev/api';
import { AccountData } from '@mimirdev/hooks/types';

import { fetcher } from './fetcher';

const CACHE: Map<string, Promise<string>> = new Map();

export const networkSerice: Record<string, string> = {};

export const jsonHeader = { 'Content-Type': 'application/json' };

export const getAuthorizationHeader = (accessToken: string) => ({ Authorization: `Bearer ${accessToken}` });

export function getServiceUrl<P extends string | null, R = P extends string ? Promise<string> : null>(path?: P): R {
  if (path === null || path === undefined) {
    return null as R;
  }

  const promise =
    CACHE.get(path) ||
    api.isReady.then((api) => {
      const baseUrl = networkSerice[api.genesisHash.toHex()] || (process.env.NODE_ENV === 'production' ? 'https://dev-api.mimir.global/' : 'http://127.0.0.1:8080/');
      // const baseUrl = 'https://dev-api.mimir.global/';

      return `${baseUrl}${path}`;
    });

  CACHE.set(path, promise);

  return promise as R;
}

export function createMultisig(who: HexString[], threshold: number, name?: string | null, isValid = true) {
  return fetcher(getServiceUrl('multisig'), {
    method: 'POST',
    body: JSON.stringify({ who, threshold, name, isValid }),
    headers: jsonHeader
  });
}

export function prepareMultisig(creator: HexString, extrinsicHash: HexString, name: string, threshold: number, who: HexString[]) {
  return fetcher(getServiceUrl('multisig/prepare'), {
    method: 'POST',
    body: JSON.stringify({ creator, extrinsicHash, who, threshold, name }),
    headers: jsonHeader
  });
}

export function updatePrepareMultisig(extrinsicHash: HexString, name: string, threshold: number, who: HexString[]) {
  return fetcher(getServiceUrl('multisig/prepare'), {
    method: 'PATCH',
    body: JSON.stringify({ extrinsicHash, who, threshold, name }),
    headers: jsonHeader
  });
}

export function updateAccountName(address: HexString, name: string) {
  return fetcher(getServiceUrl(`multisig/${address}`), {
    method: 'PATCH',
    body: JSON.stringify({ name }),
    headers: jsonHeader
  });
}

export async function getMultisigs(addresses: HexString[]): Promise<Record<HexString, AccountData>> {
  if (addresses.length === 0) return {};

  return fetcher(getServiceUrl(`multisigs/?${addresses.map((address) => `addresses=${address}`).join('&')}`), {
    method: 'GET',
    headers: jsonHeader
  });
}
