// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Endpoint } from '../types/types.js';

import { store } from '@mimir-wallet/service';
import { ApiPromise } from '@polkadot/api';

import { getTypesBundle } from '../types/api-types/index.js';
import { NETWORK_RPC_PREFIX } from '../utils/defaults.js';
import { getMetadata } from '../utils/metadata.js';
import { StoredRegistry } from '../utils/registry.js';

import { ApiProvider } from './ApiProvider.js';

/**
 * Get WebSocket endpoints with custom RPC URL support
 * Custom RPC URL from store takes priority over default endpoints
 *
 * @param apiUrl - Default API URL(s) from chain config
 * @param network - Network key for looking up custom RPC
 * @returns Array of WebSocket endpoints
 */
export function getEndpoints(
  apiUrl: string | string[],
  network: string,
): string[] {
  let wsUrl = store.get(`${NETWORK_RPC_PREFIX}${network}`) as
    | string
    | undefined;

  if (!wsUrl || (!wsUrl.startsWith('ws://') && !wsUrl.startsWith('wss://'))) {
    wsUrl = undefined;
  }

  const apiUrls = Array.isArray(apiUrl) ? apiUrl : [apiUrl];

  return wsUrl ? [wsUrl, ...apiUrls] : apiUrls;
}

/**
 * Create a new Polkadot API instance for a chain
 *
 * @param chain - Chain endpoint configuration
 * @returns Promise resolving to ApiPromise instance
 */
export async function createApi(chain: Endpoint): Promise<ApiPromise> {
  const endpoints = getEndpoints(Object.values(chain.wsUrl), chain.key);
  const provider = new ApiProvider(endpoints);
  const registry = new StoredRegistry();
  const [metadata, typesBundle] = await Promise.all([
    getMetadata(chain.key),
    getTypesBundle(),
  ]);

  return new ApiPromise({
    provider,
    registry: registry as any,
    typesBundle,
    typesChain: {
      Crust: { DispatchErrorModule: 'DispatchErrorModuleU8' },
    },
    metadata,
    noInitWarn: true,
  });
}
