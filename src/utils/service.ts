// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { HexString } from '@polkadot/util/types';
import type { Endpoint, UTM } from '@mimir-wallet/config';

import { chainLinks } from '@mimir-wallet/api/chain-links';

import { fetcher } from './fetcher';

export const networkSerice: Record<string, string> = {};

export const jsonHeader = { 'Content-Type': 'application/json' };

export const getAuthorizationHeader = (accessToken: string) => ({ Authorization: `Bearer ${accessToken}` });

export function getMetadata(chain: Endpoint): Promise<Record<string, HexString>> {
  return fetcher(chainLinks.serviceUrl(chain, 'metadata'), {
    method: 'GET',
    headers: jsonHeader
  });
}

export function createMultisig(
  chain: Endpoint,
  who: HexString[],
  threshold: number,
  name?: string | null,
  isValid = true
) {
  return fetcher(chainLinks.serviceUrl(chain, 'multisig'), {
    method: 'POST',
    body: JSON.stringify({ who, threshold, name, isValid }),
    headers: jsonHeader
  });
}

export function getFullAccount(chain: Endpoint, address: string) {
  return fetcher(chainLinks.serviceUrl(chain, `accounts/full/${address}`), {
    method: 'GET',
    headers: jsonHeader
  });
}

export function updateCalldata(chain: Endpoint, calldata: HexString) {
  return fetcher(chainLinks.serviceUrl(chain, 'calldata'), {
    method: 'POST',
    body: JSON.stringify({ calldata }),
    headers: jsonHeader
  });
}

export function prepareMultisig(
  chain: Endpoint,
  creator: HexString,
  extrinsicHash: HexString,
  name: string,
  threshold?: number | null,
  who?: HexString[] | null
) {
  return fetcher(chainLinks.serviceUrl(chain, 'multisig/prepare'), {
    method: 'POST',
    body: JSON.stringify({ creator, extrinsicHash, who, threshold, name }),
    headers: jsonHeader
  });
}

export function updatePrepareMultisig(
  chain: Endpoint,
  extrinsicHash: HexString,
  name: string,
  threshold: number,
  who: HexString[]
) {
  return fetcher(chainLinks.serviceUrl(chain, 'multisig/prepare'), {
    method: 'PATCH',
    body: JSON.stringify({ extrinsicHash, who, threshold, name }),
    headers: jsonHeader
  });
}

export function updateAccountName(chain: Endpoint, address: HexString, name: string) {
  return fetcher(chainLinks.serviceUrl(chain, `multisig/${address}`), {
    method: 'PATCH',
    body: JSON.stringify({ name }),
    headers: jsonHeader
  });
}

export async function getMultisigs(chain: Endpoint, addresses: string[]) {
  return fetcher(
    chainLinks.serviceUrl(chain, `multisigs/?${addresses.map((address) => `addresses=${address}`).join('&')}`),
    {
      method: 'GET',
      headers: jsonHeader
    }
  );
}

export async function uploadWebsite(
  chain: Endpoint,
  extrinsicHash: HexString,
  website?: string | null,
  appName?: string | null,
  iconUrl?: string | null,
  note?: string | null
): Promise<boolean> {
  return fetcher(chainLinks.serviceUrl(chain, 'website'), {
    method: 'POST',
    body: JSON.stringify({ extrinsicHash, website, appName, iconUrl, note }),
    headers: jsonHeader
  });
}

export async function utm(chain: Endpoint, address: HexString, utm: UTM): Promise<void> {
  await fetcher(chainLinks.serviceUrl(chain, `utm/${address}`), {
    method: 'POST',
    body: JSON.stringify(utm),
    headers: jsonHeader
  });
}

export async function safetyCheck(chain: Endpoint, method: HexString) {
  return fetcher(chainLinks.serviceUrl(chain, 'safety-check'), {
    method: 'POST',
    body: JSON.stringify({ method }),
    headers: jsonHeader
  });
}
