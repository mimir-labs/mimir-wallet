// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { HexString } from '@polkadot/util/types';
import type { ApiState } from './types';

import { ApiPromise, WsProvider } from '@polkadot/api';
import { deriveMapCache, setDeriveCache } from '@polkadot/api-derive/util';
import { formatBalance } from '@polkadot/util';

import { allEndpoints, Endpoint, typesBundle } from '@mimir-wallet/config';
import { useApi } from '@mimir-wallet/hooks/useApi';
import { service } from '@mimir-wallet/utils';

import { DEFAULT_AUX, statics } from './defaults';

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
  console.debug('tokenDecimals', tokenDecimals);
  console.debug('tokenSymbol', tokenSymbol);
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
    chainSS58: ss58Format,
    isApiReady: true,
    tokenSymbol: tokenSymbol[0].toString(),
    genesisHash: api.genesisHash.toHex()
  };
}

/**
 * Creates and initializes a new Polkadot API instance
 * Handles metadata retrieval and API setup with error handling
 *
 * @param apiUrl - WebSocket URL for the chain
 * @param onError - Error handler callback
 */
async function createApi(apiUrl: string, onError: (error: unknown) => void): Promise<void> {
  // Try to get metadata from service
  let metadata: Record<string, HexString> = {};

  try {
    metadata = await service.getMetadata();
  } catch {
    /* empty */
  }

  try {
    // Initialize WebSocket provider and API
    const provider = new WsProvider(apiUrl);

    statics.api = new ApiPromise({
      provider,
      typesBundle,
      typesChain: {
        Crust: {
          DispatchErrorModule: 'DispatchErrorModuleU8'
        }
      },
      metadata
    });
  } catch (error) {
    onError(error);
  }
}

/**
 * Initialize the blockchain API connection and related services
 * Sets up the main chain API and optional identity network API
 *
 * @param chain - Configuration for the target blockchain endpoint
 */
export async function initializeApi(chain: Endpoint) {
  // Initialize API state with static configuration
  useApi.setState({
    api: statics.api,
    chainSS58: chain.ss58Format,
    genesisHash: chain.genesisHash,
    apiUrl: chain.wsUrl,
    network: chain.key,
    chain: chain
  });

  // Error handler for API connection issues
  const onError = (error: unknown): void => {
    console.error(error);
    useApi.setState({
      apiError: (error as Error).message
    });
  };

  // Initialize main blockchain API connection
  createApi(chain.wsUrl, onError).then(() => {
    // Set up event listeners for connection state
    statics.api.on('connected', () => useApi.setState({ isApiConnected: true }));
    statics.api.on('disconnected', () => useApi.setState({ isApiConnected: false }));
    statics.api.on('error', onError);

    // Handle API ready state
    statics.api.on('ready', (): void => {
      useApi.setState(loadOnReady(statics.api, chain));
    });

    // Update API initialization state
    useApi.setState({ isApiInitialized: true, api: statics.api });
  });

  // Initialize secondary identity network API if configured
  // This is used for additional identity-related features
  if (chain.identityNetwork) {
    const peopleEndpoint = allEndpoints.find((item) => item.key === chain.identityNetwork);

    if (peopleEndpoint) {
      // Create WebSocket provider for identity network
      const provider = new WsProvider(peopleEndpoint.wsUrl);

      // Initialize identity API with custom types
      ApiPromise.create({
        provider,
        typesBundle
      }).then((api) => {
        useApi.setState({ identityApi: api });
      });
    }
  }
}