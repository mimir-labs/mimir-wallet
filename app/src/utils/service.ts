// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { UTM } from '@/config';
import type { HexString } from '@polkadot/util/types';

import { chainLinks } from '@/api/chain-links';

import { fetcher } from './fetcher';

export const networkSerice: Record<string, string> = {};

export const jsonHeader = { 'Content-Type': 'application/json' };

export const getAuthorizationHeader = (accessToken: string) => ({ Authorization: `Bearer ${accessToken}` });

export function getMetadata(): Promise<Record<string, HexString>> {
  return fetcher(chainLinks.serviceUrl('metadata'), {
    method: 'GET',
    headers: jsonHeader
  });
}

export function createMultisig(who: HexString[], threshold: number, name?: string | null, isValid = true) {
  return fetcher(chainLinks.serviceUrl('multisig'), {
    method: 'POST',
    body: JSON.stringify({ who, threshold, name, isValid }),
    headers: jsonHeader
  });
}

export function getFullAccount(address: string) {
  return fetcher(chainLinks.serviceUrl(`accounts/full/${address}`), {
    method: 'GET',
    headers: jsonHeader
  });
}

export function updateCalldata(calldata: HexString) {
  return fetcher(chainLinks.serviceUrl('calldata'), {
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
  return fetcher(chainLinks.serviceUrl('multisig/prepare'), {
    method: 'POST',
    body: JSON.stringify({ creator, extrinsicHash, who, threshold, name }),
    headers: jsonHeader
  });
}

export function updatePrepareMultisig(extrinsicHash: HexString, name: string, threshold: number, who: HexString[]) {
  return fetcher(chainLinks.serviceUrl('multisig/prepare'), {
    method: 'PATCH',
    body: JSON.stringify({ extrinsicHash, who, threshold, name }),
    headers: jsonHeader
  });
}

export function updateAccountName(address: HexString, name: string) {
  return fetcher(chainLinks.serviceUrl(`multisig/${address}`), {
    method: 'PATCH',
    body: JSON.stringify({ name }),
    headers: jsonHeader
  });
}

export async function getMultisigs(addresses: string[]) {
  return fetcher(chainLinks.serviceUrl(`multisigs/?${addresses.map((address) => `addresses=${address}`).join('&')}`), {
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
  return fetcher(chainLinks.serviceUrl('website'), {
    method: 'POST',
    body: JSON.stringify({ extrinsicHash, website, appName, iconUrl, note }),
    headers: jsonHeader
  });
}

export async function utm(address: HexString, utm: UTM): Promise<void> {
  await fetcher(chainLinks.serviceUrl(`utm/${address}`), {
    method: 'POST',
    body: JSON.stringify(utm),
    headers: jsonHeader
  });
}

export async function safetyCheck(method: HexString) {
  return fetcher(chainLinks.serviceUrl('safety-check'), {
    method: 'POST',
    body: JSON.stringify({ method }),
    headers: jsonHeader
  });
}

export async function getAccount(address: string) {
  return fetcher(chainLinks.serviceUrl(`accounts/full/${address}`), {
    method: 'GET',
    headers: jsonHeader
  });
}

export async function addProposer(address: string, proposer: string, signature: string, signer: string, time: string) {
  return fetcher(chainLinks.serviceUrl(`accounts/${address}/proposer/add`), {
    method: 'POST',
    body: JSON.stringify({ proposer, signature, signer, time }),
    headers: jsonHeader
  });
}

export async function removeProposer(
  address: string,
  proposer: string,
  signature: string,
  signer: string,
  time: string
) {
  return fetcher(chainLinks.serviceUrl(`accounts/${address}/proposer/remove`), {
    method: 'PUT',
    body: JSON.stringify({ proposer, signature, signer, time }),
    headers: jsonHeader
  });
}

export async function submitPropose(
  address: string,
  call: HexString,
  signer: string,
  signature: string,
  time: string,
  appName?: string,
  iconUrl?: string,
  note?: string,
  website?: string
) {
  return fetcher(chainLinks.serviceUrl(`tx/propose/${address}`), {
    method: 'POST',
    body: JSON.stringify({ call, signer, signature, time, appName, iconUrl, note, website }),
    headers: jsonHeader
  });
}

export async function removePropose(proposeId: number, signer: string, signature: string, time: string) {
  return fetcher(chainLinks.serviceUrl(`tx/propose/${proposeId}/remove`), {
    method: 'PUT',
    body: JSON.stringify({ signer, signature, time }),
    headers: jsonHeader
  });
}
