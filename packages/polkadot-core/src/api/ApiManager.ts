// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiConnection, ApiManagerListener, ChainStatus, Endpoint } from '../types/types.js';
import type { HexString } from '@polkadot/util/types';

import { store } from '@mimir-wallet/service';
import { ApiPromise } from '@polkadot/api';
import { deriveMapCache, setDeriveCache } from '@polkadot/api-derive/util';
import { isHex } from '@polkadot/util';

import { allEndpoints } from '../chains/config.js';
import { typesBundle } from '../types/api-types/index.js';
import { DEFAULT_AUX, NETWORK_RPC_PREFIX } from '../utils/defaults.js';
import { getMetadata, saveMetadata } from '../utils/metadata.js';
import { StoredRegistry } from '../utils/registry.js';

import { ApiProvider } from './ApiProvider.js';

/**
 * Singleton class for managing all blockchain API connections
 * Handles full lifecycle: initialization, connection, disconnection, reconnection, destruction
 */
export class ApiManager {
  private static instance: ApiManager | null = null;

  private apis: Map<string, ApiConnection> = new Map();
  private listeners: Set<ApiManagerListener> = new Set();
  private initPromises: Map<string, Promise<void>> = new Map();

  private constructor() {}

  /**
   * Get singleton instance
   */
  static getInstance(): ApiManager {
    if (!ApiManager.instance) {
      ApiManager.instance = new ApiManager();
    }

    return ApiManager.instance;
  }

  /**
   * Initialize API connection for a chain
   */
  async initialize(chain: Endpoint): Promise<void> {
    // Return existing promise if initialization in progress
    const existingPromise = this.initPromises.get(chain.key);

    if (existingPromise) {
      return existingPromise;
    }

    // Skip if already initialized and ready
    if (this.apis.has(chain.key) && this.apis.get(chain.key)?.status.isApiReady) {
      return;
    }

    const promise = this._doInitialize(chain);

    this.initPromises.set(chain.key, promise);

    try {
      await promise;
    } finally {
      this.initPromises.delete(chain.key);
    }
  }

  /**
   * Get API provider with custom RPC URL support
   */
  private _getApiProvider(apiUrl: string | string[], network: string): ApiProvider {
    let wsUrl = store.get(`${NETWORK_RPC_PREFIX}${network}`) as string | undefined;

    if (wsUrl && (wsUrl.startsWith('ws://') || wsUrl.startsWith('wss://'))) {
      // Valid custom RPC URL
    } else {
      wsUrl = undefined;
    }

    const apiUrls = Array.isArray(apiUrl) ? apiUrl : [apiUrl];
    const endpoints = wsUrl ? [wsUrl, ...apiUrls] : apiUrls;

    return new ApiProvider(endpoints);
  }

  /**
   * Create a new Polkadot API instance
   */
  private async _createApi(apiUrl: string | string[], network: string): Promise<ApiPromise> {
    const provider = this._getApiProvider(apiUrl, network);
    const registry = new StoredRegistry();
    const metadata = await getMetadata(network);

    return new ApiPromise({
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
    });
  }

  private async _doInitialize(chain: Endpoint): Promise<void> {
    // Set initial state
    this._updateConnection(chain.key, {
      api: null,
      chain,
      network: chain.key,
      genesisHash: chain.genesisHash,
      tokenSymbol: '',
      status: {
        isApiReady: false,
        isApiInitialized: false,
        apiError: null
      }
    });

    try {
      const api = await this._createApi(Object.values(chain.wsUrl), chain.key);

      // Setup event handlers before waiting for ready
      api.on('error', (error: Error) => this._handleError(chain.key, error));
      api.on('disconnected', () => this._handleDisconnected(chain.key));
      api.on('connected', () => this._handleConnected(chain.key));

      // Update to initialized state
      this._updateConnection(chain.key, {
        ...this.apis.get(chain.key)!,
        api,
        status: {
          isApiReady: false,
          isApiInitialized: true,
          apiError: null
        }
      });

      api.isReadyOrError.catch(() => {});
      // Wait for API to be ready using api.isReady Promise
      await api.isReady;

      // Process ready state
      const readyState = this._loadOnReady(api, chain);

      this._updateConnection(chain.key, {
        ...this.apis.get(chain.key)!,
        api,
        tokenSymbol: readyState.tokenSymbol,
        genesisHash: readyState.genesisHash,
        status: {
          isApiReady: true,
          isApiInitialized: true,
          apiError: null
        }
      });

      // Subscribe to runtime updates for metadata caching
      api.rpc.state.subscribeRuntimeVersion(async () => {
        const { metadata, runtimeVersion } = await api.getBlockRegistry(await api.rpc.chain.getBlockHash());

        saveMetadata(chain.key, api.genesisHash.toHex(), runtimeVersion.specVersion.toString(), metadata.toHex());
      });
    } catch (error) {
      this._handleError(chain.key, error as Error);
      throw error;
    }
  }

  private _loadOnReady(api: ApiPromise, chain: Endpoint) {
    const properties = api.registry.createType('ChainProperties', {
      ss58Format: api.registry.chainSS58,
      tokenDecimals: api.registry.chainDecimals,
      tokenSymbol: api.registry.chainTokens
    });

    const tokenSymbol = properties.tokenSymbol.unwrapOr([...DEFAULT_AUX]);
    const tokenDecimals = properties.tokenDecimals.unwrapOr([api.registry.createType('u32', 12)]);

    api.registry.setChainProperties(
      api.registry.createType('ChainProperties', {
        ss58Format: chain.ss58Format,
        tokenDecimals,
        tokenSymbol
      })
    );

    setDeriveCache(api.genesisHash.toHex(), deriveMapCache);

    return {
      tokenSymbol: tokenSymbol[0].toString(),
      genesisHash: api.genesisHash.toHex() as HexString
    };
  }

  private _handleError(network: string, error: Error): void {
    console.error(`[ApiManager] Error for ${network}:`, error);
    const connection = this.apis.get(network);

    if (connection) {
      this._updateConnection(network, {
        ...connection,
        status: { ...connection.status, apiError: error.message }
      });
    }
  }

  private _handleDisconnected(network: string): void {
    const connection = this.apis.get(network);

    if (connection) {
      this._updateConnection(network, {
        ...connection,
        status: { ...connection.status, isApiReady: false }
      });
    }
  }

  private _handleConnected(network: string): void {
    const connection = this.apis.get(network);

    if (connection && connection.api?.isReady) {
      this._updateConnection(network, {
        ...connection,
        status: { ...connection.status, isApiReady: true, apiError: null }
      });
    }
  }

  private _updateConnection(network: string, connection: ApiConnection): void {
    this.apis.set(network, connection);
    this._notifyListeners();
  }

  private _notifyListeners(): void {
    const snapshot = this.getAllApis();

    this.listeners.forEach((listener) => listener(snapshot));
  }

  /**
   * Destroy API connection
   */
  destroy(network: string): void {
    const connection = this.apis.get(network);

    if (connection?.api) {
      connection.api.disconnect();
    }

    this.apis.delete(network);
    this._notifyListeners();
  }

  /**
   * Reconnect to a chain
   */
  async reconnect(network: string): Promise<void> {
    const connection = this.apis.get(network);

    if (!connection) {
      throw new Error(`No connection found for network: ${network}`);
    }

    this.destroy(network);
    await this.initialize(connection.chain);
  }

  /**
   * Get API instance by network key or genesis hash
   * Returns a Promise that resolves when the API is ready
   * Will auto-initialize if chain is found in endpoints but not yet initialized
   */
  async getApi(networkOrGenesisHash: string): Promise<ApiPromise> {
    // Check if already connected and ready
    const connection = this._resolveConnection(networkOrGenesisHash);

    if (connection?.api && connection.status.isApiReady) {
      return connection.api;
    }

    // Try to auto-initialize if chain exists in endpoints
    const chain = ApiManager.resolveChain(networkOrGenesisHash);

    if (chain) {
      await this.initialize(chain);
      const newConnection = this._resolveConnection(networkOrGenesisHash);

      if (newConnection?.api) {
        return newConnection.api;
      }
    }

    throw new Error(`API not available for: ${networkOrGenesisHash}`);
  }

  /**
   * Get chain status by network key or genesis hash
   */
  getStatus(networkOrGenesisHash: string): ChainStatus {
    const connection = this._resolveConnection(networkOrGenesisHash);

    return (
      connection?.status ?? {
        isApiReady: false,
        isApiInitialized: false,
        apiError: null
      }
    );
  }

  /**
   * Get all API connections
   */
  getAllApis(): Record<string, ApiConnection> {
    return Object.fromEntries(this.apis.entries());
  }

  /**
   * Subscribe to state changes
   */
  subscribe(listener: ApiManagerListener): () => void {
    this.listeners.add(listener);
    // Immediately notify with current state
    listener(this.getAllApis());

    return () => this.listeners.delete(listener);
  }

  /**
   * Resolve chain identifier to connection
   */
  private _resolveConnection(networkOrGenesisHash: string): ApiConnection | undefined {
    // Try direct lookup by network key
    if (this.apis.has(networkOrGenesisHash)) {
      return this.apis.get(networkOrGenesisHash);
    }

    // Try lookup by genesis hash
    if (isHex(networkOrGenesisHash)) {
      for (const connection of this.apis.values()) {
        if (connection.genesisHash === networkOrGenesisHash) {
          return connection;
        }
      }
    }

    return undefined;
  }

  /**
   * Resolve chain identifier to Endpoint (static utility)
   */
  static resolveChain(chainOrGenesisHash: string): Endpoint | undefined {
    if (isHex(chainOrGenesisHash)) {
      return allEndpoints.find((item) => item.genesisHash === chainOrGenesisHash);
    }

    return allEndpoints.find((item) => item.key === chainOrGenesisHash);
  }

  /**
   * Get the identity network key for a given network
   * Some chains delegate identity to another chain (e.g., parachains to relay chains)
   */
  static getIdentityNetwork(network: string): string {
    const chainInfo = allEndpoints.find((e) => e.key === network);

    return chainInfo?.identityNetwork ?? network;
  }

  /**
   * Get API instance for identity queries
   * Resolves the identity network and returns the API for that network
   *
   * @param network - Network key to get identity API for
   * @returns Promise resolving to ApiPromise for identity queries
   */
  async getIdentityApi(network: string): Promise<ApiPromise> {
    const identityNetwork = ApiManager.getIdentityNetwork(network);

    return this.getApi(identityNetwork);
  }
}
