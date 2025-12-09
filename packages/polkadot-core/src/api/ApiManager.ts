// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type {
  ApiConnection,
  ApiManagerListener,
  ChainStatus,
  Endpoint,
} from '../types/types.js';
import type { HexString } from '@polkadot/util/types';

import { ApiPromise } from '@polkadot/api';
import { deriveMapCache, setDeriveCache } from '@polkadot/api-derive/util';
import { isHex } from '@polkadot/util';

import { DEFAULT_AUX } from '../utils/defaults.js';
import { saveMetadata } from '../utils/metadata.js';

import { createApi } from './api-factory.js';
import { getIdentityNetwork, resolveChain } from './chain-resolver.js';

/**
 * Singleton class for managing all blockchain API connections
 * Handles full lifecycle: initialization, connection, disconnection, reconnection, destruction
 */
export class ApiManager {
  private static instance: ApiManager | null = null;

  private apis: Map<string, ApiConnection> = new Map();
  private listeners: Set<ApiManagerListener> = new Set();
  private initPromises: Map<string, Promise<void>> = new Map();
  // Map<network, Set<source>> - Track which sources reference each network
  private references: Map<string, Set<string>> = new Map();
  // Map<network, Set<listener>> - Chain-specific listeners for efficient single-chain subscriptions
  private chainListeners: Map<string, Set<(status: ChainStatus) => void>> =
    new Map();

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
    if (
      this.apis.has(chain.key) &&
      this.apis.get(chain.key)?.status.isApiReady
    ) {
      return;
    }

    const promise = this._doInitialize(chain);

    this.initPromises.set(chain.key, promise);

    await promise;
    this.initPromises.delete(chain.key);
  }

  private _doInitialize(chain: Endpoint): Promise<void> {
    return new Promise((resolve, reject) => {
      // Set initial state
      this._updateConnection(chain.key, {
        api: null,
        chain,
        network: chain.key,
        genesisHash: chain.genesisHash,
        tokenSymbol: '',
        status: {
          isApiConnected: false,
          isApiReady: false,
          isApiInitialized: false,
          apiError: null,
        },
      });

      createApi(chain)
        .then((api) => {
          // Update to initialized state
          this._updateConnection(chain.key, {
            ...this.apis.get(chain.key)!,
            api,
            status: {
              isApiConnected: false,
              isApiReady: false,
              isApiInitialized: true,
              apiError: null,
            },
          });

          // Setup event handlers for state management
          api.on('error', (error: Error) =>
            this._handleError(chain.key, error),
          );
          api.on('disconnected', () => this._handleDisconnected(chain.key));
          api.on('connected', () => this._handleConnected(chain.key));
          api.on('ready', () => {
            this._setReady(chain.key);
            resolve();
          });
        })
        .catch((error) => {
          reject(error);
          this._handleError(chain.key, error as Error);
        });
    });
  }

  /**
   * Configure chain properties and cache when API becomes ready
   */
  private _loadOnReady(api: ApiPromise, chain: Endpoint) {
    const properties = api.registry.createType('ChainProperties', {
      ss58Format: api.registry.chainSS58,
      tokenDecimals: api.registry.chainDecimals,
      tokenSymbol: api.registry.chainTokens,
    });

    const tokenSymbol = properties.tokenSymbol.unwrapOr([...DEFAULT_AUX]);
    const tokenDecimals = properties.tokenDecimals.unwrapOr([
      api.registry.createType('u32', 12),
    ]);

    api.registry.setChainProperties(
      api.registry.createType('ChainProperties', {
        ss58Format: chain.ss58Format,
        tokenDecimals,
        tokenSymbol,
      }),
    );

    setDeriveCache(api.genesisHash.toHex(), deriveMapCache);

    return {
      tokenSymbol: tokenSymbol[0].toString(),
      genesisHash: api.genesisHash.toHex() as HexString,
    };
  }

  /**
   * Set API to ready state (idempotent - safe to call multiple times)
   */
  private _setReady(network: string): void {
    const connection = this.apis.get(network);

    if (!connection?.api) return;

    const readyState = this._loadOnReady(connection.api, connection.chain);

    this._updateConnection(network, {
      ...connection,
      tokenSymbol: readyState.tokenSymbol,
      genesisHash: readyState.genesisHash,
      status: {
        isApiConnected: true,
        isApiReady: true,
        isApiInitialized: true,
        apiError: null,
      },
    });

    // Subscribe to runtime updates for metadata caching
    connection.api.rpc.state.subscribeRuntimeVersion(async () => {
      const { metadata, runtimeVersion } =
        await connection.api!.getBlockRegistry(
          await connection.api!.rpc.chain.getBlockHash(),
        );

      saveMetadata(
        network,
        connection.api!.genesisHash.toHex(),
        runtimeVersion.specVersion.toString(),
        metadata.toHex(),
      );
    });
  }

  private _handleError(network: string, error: Error): void {
    console.error(`[ApiManager] Error for ${network}:`, error);
    const connection = this.apis.get(network);

    if (connection) {
      this._updateConnection(network, {
        ...connection,
        status: { ...connection.status, apiError: error.message },
      });
    }
  }

  private _handleDisconnected(network: string): void {
    const connection = this.apis.get(network);

    if (connection) {
      this._updateConnection(network, {
        ...connection,
        status: { ...connection.status, isApiConnected: false },
      });
    }
  }

  private _handleConnected(network: string): void {
    const connection = this.apis.get(network);

    if (!connection) return;

    this._updateConnection(network, {
      ...connection,
      status: {
        ...connection.status,
        isApiConnected: true,
        apiError: null,
      },
    });
  }

  private _updateConnection(network: string, connection: ApiConnection): void {
    this.apis.set(network, connection);
    // Notify chain-specific listeners first (more efficient)
    this._notifyChainListeners(network, connection.status);
    // Notify global listeners
    this._notifyListeners();
  }

  private _notifyChainListeners(network: string, status: ChainStatus): void {
    const listeners = this.chainListeners.get(network);

    if (listeners) {
      listeners.forEach((listener) => listener(status));
    }
  }

  private _notifyListeners(): void {
    const snapshot = this.getAllApis();

    this.listeners.forEach((listener) => listener(snapshot));
  }

  /**
   * Add a reference to a network
   * @param network - The network being referenced
   * @param source - The source of reference (e.g., 'user', 'identity:assethub-polkadot', 'xcm:hydration')
   */
  addReference(network: string, source: string): void {
    if (!this.references.has(network)) {
      this.references.set(network, new Set());
    }

    this.references.get(network)!.add(source);
  }

  /**
   * Remove a reference from a network
   * @param network - The network being dereferenced
   * @param source - The source of reference to remove
   * @returns true if no more references remain (network can be disconnected)
   */
  removeReference(network: string, source: string): boolean {
    const refs = this.references.get(network);

    if (refs) {
      refs.delete(source);

      if (refs.size === 0) {
        this.references.delete(network);

        return true;
      }
    }

    return false;
  }

  /**
   * Check if a network has any references
   */
  hasReferences(network: string): boolean {
    const refs = this.references.get(network);

    return refs ? refs.size > 0 : false;
  }

  /**
   * Get all references for a network
   */
  getReferences(network: string): Set<string> {
    return this.references.get(network) ?? new Set();
  }

  /**
   * Destroy API connection (only if no references remain)
   * If the network still has references, this method does nothing
   */
  destroy(network: string): void {
    // Only disconnect if no references remain
    if (this.hasReferences(network)) {
      return;
    }

    const connection = this.apis.get(network);

    if (connection?.api) {
      connection.api.disconnect();
    }

    this.apis.delete(network);
    this._notifyListeners();
    this.initPromises.delete(network);
  }

  /**
   * Force destroy API connection regardless of references
   * Use this for testing or cleanup scenarios
   */
  forceDestroy(network: string): void {
    // Clear all references
    this.references.delete(network);

    const connection = this.apis.get(network);

    if (connection?.api) {
      connection.api.disconnect();
    }

    this.apis.delete(network);
    this._notifyListeners();
    this.initPromises.delete(network);
  }

  /**
   * Reconnect to a chain
   */
  async reconnect(network: string): Promise<void> {
    const connection = this.apis.get(network);

    if (!connection) {
      throw new Error(`No connection found for network: ${network}`);
    }

    this.forceDestroy(network);
    await this.initialize(connection.chain);
  }

  /**
   * Get API instance by network key or genesis hash
   * Returns a Promise that resolves when the API is ready
   * Will auto-initialize if chain is found in endpoints but not yet initialized
   * @param networkOrGenesisHash - Network key or genesis hash
   * @param timeout - Timeout: false for no timeout (default), true for 15s timeout, or number for custom timeout in ms
   */
  async getApi(
    networkOrGenesisHash: string,
    timeout: number | boolean = false,
  ): Promise<ApiPromise> {
    const apiPromise = (async () => {
      // Check if already connected and ready
      const connection = this._resolveConnection(networkOrGenesisHash);

      if (connection?.api && connection.status.isApiReady) {
        return connection.api;
      }

      // Try to auto-initialize if chain exists in endpoints
      const chain = ApiManager.resolveChain(networkOrGenesisHash);

      if (!chain) {
        throw new Error(`Chain not found: ${networkOrGenesisHash}`);
      }

      await this.initialize(chain);

      const newConnection = this._resolveConnection(networkOrGenesisHash);

      if (!newConnection?.api) {
        throw new Error(`API not available for: ${networkOrGenesisHash}`);
      }

      return newConnection.api.isReady;
    })();

    // If timeout is false, no timeout limit
    if (timeout === false) {
      return apiPromise;
    }

    // timeout: true means 15s, otherwise use the provided number
    const timeoutMs = timeout === true ? 15000 : timeout;

    // Wait for ready with timeout
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(
        () =>
          reject(new Error(`Connection timeout for: ${networkOrGenesisHash}`)),
        timeoutMs,
      );
    });

    return Promise.race([apiPromise, timeoutPromise]);
  }

  /**
   * Get chain status by network key or genesis hash
   */
  getStatus(networkOrGenesisHash: string): ChainStatus {
    const connection = this._resolveConnection(networkOrGenesisHash);

    return (
      connection?.status ?? {
        isApiConnected: false,
        isApiReady: false,
        isApiInitialized: false,
        apiError: null,
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
   * Subscribe to all chains' state changes
   */
  subscribe(listener: ApiManagerListener): () => void {
    this.listeners.add(listener);
    // Immediately notify with current state
    listener(this.getAllApis());

    return () => this.listeners.delete(listener);
  }

  /**
   * Subscribe to a specific chain's status changes
   * More efficient than subscribe() when only one chain is needed
   * @param network - The network key to subscribe to
   * @param listener - Callback function that receives the chain status
   * @returns Unsubscribe function
   */
  subscribeToChain(
    network: string,
    listener: (status: ChainStatus) => void,
  ): () => void {
    if (!this.chainListeners.has(network)) {
      this.chainListeners.set(network, new Set());
    }

    this.chainListeners.get(network)!.add(listener);

    // Immediately notify with current status
    const connection = this.apis.get(network);

    listener(
      connection?.status ?? {
        isApiConnected: false,
        isApiReady: false,
        isApiInitialized: false,
        apiError: null,
      },
    );

    return () => {
      const listeners = this.chainListeners.get(network);

      if (listeners) {
        listeners.delete(listener);

        if (listeners.size === 0) {
          this.chainListeners.delete(network);
        }
      }
    };
  }

  /**
   * Resolve chain identifier to connection
   */
  private _resolveConnection(
    networkOrGenesisHash: string,
  ): ApiConnection | undefined {
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
  static resolveChain = resolveChain;

  /**
   * Get API instance for identity queries
   * Resolves the identity network and returns the API for that network
   * Automatically adds identity reference when the identity network differs
   *
   * @param network - Network key to get identity API for
   * @returns Promise resolving to ApiPromise for identity queries
   */
  async getIdentityApi(network: string): Promise<ApiPromise> {
    const identityNetwork = getIdentityNetwork(network);

    // Add identity reference if the identity network is different from the requesting network
    if (identityNetwork !== network) {
      this.addReference(identityNetwork, `identity:${network}`);
    }

    return this.getApi(identityNetwork);
  }
}
