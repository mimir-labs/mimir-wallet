// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountData, CalldataStatus } from '@mimir-wallet/hooks/types';
import type { HexString } from '@polkadot/util/types';

import { serviceUrl } from './chain-links';
import { fetcher } from './fetcher';

const CACHE: Map<string, Promise<string>> = new Map();

export const networkSerice: Record<string, string> = {};

export const jsonHeader = { 'Content-Type': 'application/json' };

export const getAuthorizationHeader = (accessToken: string) => ({ Authorization: `Bearer ${accessToken}` });

export function getServiceUrl<P extends string | null, R = P extends string ? Promise<string> : null>(path?: P): R {
  if (path === null || path === undefined) {
    return null as R;
  }

  const promise = CACHE.get(path) || serviceUrl(path);

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

export async function getMultisigs(addresses: string[]): Promise<Record<HexString, AccountData>> {
  if (addresses.length === 0) return {};

  return fetcher(getServiceUrl(`multisigs/?${addresses.map((address) => `addresses=${address}`).join('&')}`), {
    method: 'GET',
    headers: jsonHeader
  });
}

export async function uploadWebsite(extrinsicHash: HexString, website?: string, note?: string): Promise<boolean> {
  return fetcher(getServiceUrl('website'), {
    method: 'POST',
    body: JSON.stringify({ extrinsicHash, website, note }),
    headers: jsonHeader
  });
}

export async function getStatus(uuid: string): Promise<{ status: CalldataStatus }> {
  return fetcher(getServiceUrl(`tx/${uuid}/status`), {
    method: 'GET',
    headers: jsonHeader
  });
}

export async function setReferrer(address: HexString, referrer: string): Promise<void> {
  await fetcher(getServiceUrl(`referrer/${address}`), {
    method: 'POST',
    body: JSON.stringify({ referrer }),
    headers: jsonHeader
  });
}
