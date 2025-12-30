// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Endpoint } from '../types/types.js';
import type { PolkadotClient } from 'polkadot-api';

import { store } from '@mimir-wallet/service';
import { createClient } from 'polkadot-api';
import { withPolkadotSdkCompat } from 'polkadot-api/polkadot-sdk-compat';

import { getTypesBundle } from '../types/api-types/index.js';
import { NETWORK_RPC_PREFIX } from '../utils/defaults.js';
import { getMetadata } from '../utils/metadata.js';
import { StoredRegistry } from '../utils/registry.js';

import { ApiPromise$ } from './ApiPromise$.js';
import { ApiProvider } from './ApiProvider.js';
import { PapiProviderAdapter } from './PapiProviderAdapter.js';

// Provider registry: stores ApiProvider references for each network
const providerRegistry = new Map<string, ApiProvider>();

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
 * Get ApiProvider for a network
 *
 * @param network - Network key
 * @returns ApiProvider instance or undefined if not found
 */
export function getProvider(network: string): ApiProvider | undefined {
  return providerRegistry.get(network);
}

/**
 * Create a papi PolkadotClient for a network
 * Requires ApiProvider to be already created via createApi()
 *
 * @param network - Network key
 * @returns PolkadotClient instance or null if provider not found
 */
export function createPapiClient(network: string): PolkadotClient | null {
  const provider = providerRegistry.get(network);

  if (!provider) return null;

  const adapter = new PapiProviderAdapter(provider);

  return createClient(withPolkadotSdkCompat(adapter.getJsonRpcProvider()));
}

/**
 * Clear provider reference from registry
 * Should be called when destroying a connection
 *
 * @param network - Network key
 */
export function clearProvider(network: string): void {
  providerRegistry.delete(network);
}

/**
 * Create a new Polkadot API instance for a chain
 *
 * @param chain - Chain endpoint configuration
 * @returns Promise resolving to ApiPromise instance
 */
export async function createApi(chain: Endpoint): Promise<ApiPromise$> {
  const endpoints = getEndpoints(Object.values(chain.wsUrl), chain.key);
  const provider = new ApiProvider(endpoints);

  // Store provider reference for papi adapter
  providerRegistry.set(chain.key, provider);

  const registry = new StoredRegistry();
  const [metadata, typesBundle] = await Promise.all([
    getMetadata(chain.key),
    getTypesBundle(),
  ]);

  return new ApiPromise$({
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
