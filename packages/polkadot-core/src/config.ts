// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { HexString } from '@polkadot/util/types';
import type { Endpoint } from './types.js';

import kusamaChains from './chains/kusama.json' with { type: 'json' };
import paseoChains from './chains/paseo.json' with { type: 'json' };
import polkadotChains from './chains/polkadot.json' with { type: 'json' };
import solochainChains from './chains/solochain.json' with { type: 'json' };
import westendChains from './chains/westend.json' with { type: 'json' };

export const allEndpoints: Endpoint[] = import.meta.env.VITE_ENDPOINTS
  ? JSON.parse(import.meta.env.VITE_ENDPOINTS)
  : [
      ...(polkadotChains as unknown as Endpoint[]),
      ...(kusamaChains as unknown as Endpoint[]),
      ...(paseoChains as unknown as Endpoint[]),
      ...(westendChains as unknown as Endpoint[]),
      ...(solochainChains as unknown as Endpoint[])
    ];

export const remoteProxyRelations: Record<HexString, HexString> = allEndpoints.reduce(
  (acc, item) => {
    if (item.remoteProxyTo) {
      acc[item.genesisHash] = item.remoteProxyTo as HexString;
    }

    return acc;
  },
  {} as Record<HexString, HexString>
);

const chainMap: Map<string, Endpoint | undefined> = new Map();

export function getChainIcon(key: string) {
  if (chainMap.has(key)) {
    return chainMap.get(key);
  }

  const endpoint = allEndpoints.find((item) => item.key === key || item.genesisHash === key);

  chainMap.set(key, endpoint);

  return endpoint;
}
