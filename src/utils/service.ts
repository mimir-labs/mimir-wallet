// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { HexString } from '@polkadot/util/types';
import type { UTM } from '@mimir-wallet/config';
import type { SafetyLevel, TransactionStatus } from '@mimir-wallet/hooks/types';

import { serviceUrl } from './chain-links';
import { fetcher } from './fetcher';

export const networkSerice: Record<string, string> = {};

export const jsonHeader = { 'Content-Type': 'application/json' };

export const getAuthorizationHeader = (accessToken: string) => ({ Authorization: `Bearer ${accessToken}` });

export function getMetadata(): Promise<Record<string, HexString>> {
  return fetcher(serviceUrl('metadata'), {
    method: 'GET',
    headers: jsonHeader
  });
}

export function createMultisig(who: HexString[], threshold: number, name?: string | null, isValid = true) {
  return fetcher(serviceUrl('multisig'), {
    method: 'POST',
    body: JSON.stringify({ who, threshold, name, isValid }),
    headers: jsonHeader
  });
}

export function getFullAccount(address: string) {
  return fetcher(serviceUrl(`accounts/full/${address}`), {
    method: 'GET',
    headers: jsonHeader
  });
}

export function updateCalldata(calldata: HexString) {
  return fetcher(serviceUrl('calldata'), {
    method: 'POST',
    body: JSON.stringify({ calldata }),
    headers: jsonHeader
  });
}

export function prepareMultisig(
  creator: HexString,
  extrinsicHash: HexString,
  name: string,
  threshold?: number | null,
  who?: HexString[] | null
) {
  return fetcher(serviceUrl('multisig/prepare'), {
    method: 'POST',
    body: JSON.stringify({ creator, extrinsicHash, who, threshold, name }),
    headers: jsonHeader
  });
}

export function updatePrepareMultisig(extrinsicHash: HexString, name: string, threshold: number, who: HexString[]) {
  return fetcher(serviceUrl('multisig/prepare'), {
    method: 'PATCH',
    body: JSON.stringify({ extrinsicHash, who, threshold, name }),
    headers: jsonHeader
  });
}

export function updateAccountName(address: HexString, name: string) {
  return fetcher(serviceUrl(`multisig/${address}`), {
    method: 'PATCH',
    body: JSON.stringify({ name }),
    headers: jsonHeader
  });
}

export async function getMultisigs(addresses: string[]) {
  return fetcher(serviceUrl(`multisigs/?${addresses.map((address) => `addresses=${address}`).join('&')}`), {
    method: 'GET',
    headers: jsonHeader
  });
}

export async function uploadWebsite(
  extrinsicHash: HexString,
  website?: string | null,
  appName?: string | null,
  iconUrl?: string | null,
  note?: string | null
): Promise<boolean> {
  return fetcher(serviceUrl('website'), {
    method: 'POST',
    body: JSON.stringify({ extrinsicHash, website, appName, iconUrl, note }),
    headers: jsonHeader
  });
}

export async function getStatus(uuid: string): Promise<{ status: TransactionStatus }> {
  return fetcher(serviceUrl(`tx/${uuid}/status`), {
    method: 'GET',
    headers: jsonHeader
  });
}

export async function utm(address: HexString, utm: UTM): Promise<void> {
  await fetcher(serviceUrl(`utm/${address}`), {
    method: 'POST',
    body: JSON.stringify(utm),
    headers: jsonHeader
  });
}

export async function safetyCheck(method: HexString): Promise<SafetyLevel> {
  return fetcher(serviceUrl('safety-check'), {
    method: 'POST',
    body: JSON.stringify({ method }),
    headers: jsonHeader
  });
}
