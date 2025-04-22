// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiProps, ApiState, Endpoint } from './types.js';

import { ApiPromise } from '@polkadot/api';
import { deriveMapCache, setDeriveCache } from '@polkadot/api-derive/util';
import { formatBalance } from '@polkadot/util';

import { store } from '@mimir-wallet/service';

import { typesBundle } from './api-types/index.js';
import { ApiProvider } from './ApiProvider.js';
import { DEFAULT_AUX, NETWORK_RPC_PREFIX } from './defaults.js';
import { getMetadata, saveMetadata } from './metadata.js';
import { StoredRegistry } from './registry.js';
import { useAllApis } from './useApiStore.js';
import { enableNetwork } from './useNetworks.js';

/**
 * Initializes and configures the API after it's ready
 * This function sets up:
 * - Chain properties (SS58 format, decimals, symbols)
 * - Balance formatting defaults
 * - Derive caching for better performance
 *
 * @param api - The Polkadot API instance
 * @param chain - The endpoint configuration
 * @returns ApiState object containing chain configuration
 */
function loadOnReady(api: ApiPromise, chain: Endpoint): ApiState {
  // Create chain properties with registry information
  const properties = api.registry.createType('ChainProperties', {
    ss58Format: api.registry.chainSS58,
    tokenDecimals: api.registry.chainDecimals,
    tokenSymbol: api.registry.chainTokens
  });

  // Extract and set chain-specific properties
  const ss58Format = chain.ss58Format;
  const tokenSymbol = properties.tokenSymbol.unwrapOr([formatBalance.getDefaults().unit, ...DEFAULT_AUX]);
  const tokenDecimals = properties.tokenDecimals.unwrapOr([api.registry.createType('u32', 12)]);

  // Debug logging for chain configuration
  console.debug(
    'tokenDecimals',
    tokenDecimals.map((b) => b.toNumber())
  );
  console.debug(
    'tokenSymbol',
    tokenSymbol.map((b) => b.toString())
  );
  console.debug('onchain ss58Format', api.registry.chainSS58);
  console.debug('ss58Format', ss58Format);
  console.debug('genesisHash', api.genesisHash.toHex());

  // Override chain properties with specified SS58 format
  api.registry.setChainProperties(
    api.registry.createType('ChainProperties', { ss58Format: chain.ss58Format, tokenDecimals, tokenSymbol })
  );

  // Configure balance formatting for UI display
  formatBalance.setDefaults({
    decimals: tokenDecimals.map((b) => b.toNumber()),
    unit: tokenSymbol[0].toString()
  });

  // Setup derive caching for performance optimization
  setDeriveCache(api.genesisHash.toHex(), deriveMapCache);

  return {
    isApiReady: true,
    tokenSymbol: tokenSymbol[0].toString(),
    genesisHash: api.genesisHash.toHex()
  };
}

function getApiProvider(apiUrl: string | string[], network: string, httpUrl?: string) {
  let wsUrl = store.get(`${NETWORK_RPC_PREFIX}${network}`) as string | undefined;

  if (wsUrl && (wsUrl.startsWith('ws://') || wsUrl.startsWith('wss://'))) {
    /* empty */
  } else {
    wsUrl = undefined;
  }

  const apiUrls = Array.isArray(apiUrl) ? apiUrl : [apiUrl];

  const provider = new ApiProvider(wsUrl ? [wsUrl, ...apiUrls] : apiUrls, httpUrl);

  return provider;
}

/**
 * Creates and initializes a new Polkadot API instance
 * Handles metadata retrieval and API setup with error handling
 *
 * @param apiUrl - WebSocket URL(s) for the chain
 * @param httpUrl - HTTP URL for the chain
 * @param onError - Error handler callback
 */
async function createApi(
  apiUrl: string | string[],
  network: string,
  httpUrl?: string
): Promise<[ApiPromise, StoredRegistry]> {
  // Initialize WebSocket provider and API
  const provider = getApiProvider(apiUrl, network, httpUrl);

  const registry = new StoredRegistry();

  const metadata = await getMetadata(network);

  return [
    new ApiPromise({
      provider,
      registry: registry as any,
      typesBundle: typesBundle,
      typesChain: {
        Crust: {
          DispatchErrorModule: 'DispatchErrorModuleU8'
        }
      },
      metadata,
      rpcCacheCapacity: 1
    }),
    registry
  ];
}

/**
 * Initialize the blockchain API connection and related services
 * Sets up the main chain API and optional identity network API
 *
 * @param chain - Configuration for the target blockchain endpoint
 */
export async function initializeApi(chain: Endpoint) {
  if (useAllApis.getState().chains[chain.key]) {
    return;
  }

  // enable network
  enableNetwork(chain.key);

  // Initialize API state with static configuration
  useAllApis.setState((state) => ({
    chains: {
      ...state.chains,
      [chain.key]: {
        genesisHash: chain.genesisHash,
        network: chain.key,
        chain: chain
      } as ApiProps
    }
  }));

  // Error handler for API connection issues
  const onError = (error: unknown): void => {
    console.error(error);
    useAllApis.setState((state) =>
      state.chains[chain.key]
        ? {
            chains: {
              ...state.chains,
              [chain.key]: {
                ...state.chains[chain.key],
                apiError: (error as Error).message
              }
            }
          }
        : state
    );
  };

  // Initialize main blockchain API connection
  return new Promise<void>((resolve) => {
    createApi(Object.values(chain.wsUrl), chain.key, chain.httpUrl)
      .then(([api, registry]) => {
        // Set up event listeners for connection state
        api.on('error', onError);

        // Handle API ready state
        api.on('ready', (): void => {
          resolve();
          useAllApis.setState((state) =>
            state.chains[chain.key]
              ? {
                  chains: {
                    ...state.chains,
                    [chain.key]: {
                      ...state.chains[chain.key],
                      ...loadOnReady(api, chain),
                      api: api
                    }
                  }
                }
              : state
          );
          api.rpc.state.subscribeRuntimeVersion((runtimeVersion) => {
            const specVersion = runtimeVersion.specVersion.toString();
            const metadata = registry.latestMetadata.toHex();

            saveMetadata(chain.key, api.genesisHash.toHex(), specVersion, metadata);
          });
        });

        // Update API initialization state
        useAllApis.setState((state) =>
          state.chains[chain.key]
            ? {
                chains: {
                  ...state.chains,
                  [chain.key]: {
                    ...state.chains[chain.key],
                    isApiInitialized: true,
                    api: api
                  }
                }
              }
            : state
        );
      })
      .catch(onError);
  });
}

export function destroyApi(network: string) {
  useAllApis.setState((state) => {
    const apiState = state.chains[network];

    if (apiState) {
      apiState.api?.disconnect();
    }

    return {
      chains: Object.fromEntries(Object.entries(state.chains).filter(([key]) => key !== network))
    };
  });
}
