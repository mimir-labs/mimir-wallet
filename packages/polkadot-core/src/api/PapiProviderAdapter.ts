// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiProvider } from './ApiProvider.js';

/**
 * papi JsonRpcConnection interface
 */
export interface JsonRpcConnection {
  send: (message: string) => void;
  disconnect: () => void;
}

/**
 * papi JsonRpcProvider interface
 * A function that takes a message handler and returns a connection object
 */
export type JsonRpcProvider = (
  onMessage: (message: string) => void,
) => JsonRpcConnection;

/**
 * Adapter to bridge ApiProvider to papi's JsonRpcProvider interface.
 * Enables sharing the same WebSocket connection between @polkadot/api and polkadot-api.
 *
 * @example
 * ```typescript
 * const provider = new ApiProvider(endpoints);
 * const adapter = new PapiProviderAdapter(provider);
 * const client = createClient(withPolkadotSdkCompat(adapter.getJsonRpcProvider()));
 * ```
 */
export class PapiProviderAdapter {
  readonly #provider: ApiProvider;
  #messageHandler: ((message: string) => void) | null = null;

  constructor(provider: ApiProvider) {
    this.#provider = provider;
  }

  /**
   * Returns a papi-compatible JsonRpcProvider function
   */
  getJsonRpcProvider(): JsonRpcProvider {
    return (onMessage: (message: string) => void): JsonRpcConnection => {
      this.#messageHandler = onMessage;

      return {
        send: (message: string) => this.#handleSend(message),
        disconnect: () => this.#handleDisconnect(),
      };
    };
  }

  /**
   * Handle outgoing JSON-RPC messages from papi.
   * Parses the message, calls ApiProvider methods, and sends responses back.
   */
  #handleSend(message: string): void {
    const parsed = JSON.parse(message) as {
      id: number;
      method: string;
      params: unknown[];
    };
    const { id, method, params } = parsed;

    // Handle different types of requests
    if (method.includes('subscribe') && !method.includes('unsubscribe')) {
      this.#handleSubscription(id, method, params).catch((error) => {
        this.#sendError(id, (error as Error).message);
      });
    } else if (method.includes('unsubscribe')) {
      this.#handleUnsubscribe(id, method, params).catch((error) => {
        this.#sendError(id, (error as Error).message);
      });
    } else {
      this.#handleRequest(id, method, params).catch((error) => {
        this.#sendError(id, (error as Error).message);
      });
    }
  }

  /**
   * Handle regular RPC requests
   */
  async #handleRequest(
    id: number,
    method: string,
    params: unknown[],
  ): Promise<void> {
    const result = await this.#provider.send(method, params);

    this.#sendResult(id, result);
  }

  /**
   * Handle subscription requests
   */
  async #handleSubscription(
    id: number,
    method: string,
    params: unknown[],
  ): Promise<void> {
    // Derive subscription type (e.g., chain_subscribeNewHead -> chain_newHead)
    const subscriptionType = method.replace('_subscribe', '_');

    const subId = await this.#provider.subscribe(
      subscriptionType,
      method,
      params,
      (error, result) => {
        if (error) {
          console.error('[PapiProviderAdapter] Subscription error:', error);

          return;
        }

        // Forward subscription notifications to papi
        this.#sendNotification(subscriptionType, subId, result);
      },
    );

    // Send subscription confirmation
    this.#sendResult(id, subId);
  }

  /**
   * Handle unsubscribe requests
   */
  async #handleUnsubscribe(
    id: number,
    method: string,
    params: unknown[],
  ): Promise<void> {
    const subscriptionType = method.replace('_unsubscribe', '_');
    const [subId] = params as [string | number];

    const result = await this.#provider.unsubscribe(
      subscriptionType,
      method,
      subId,
    );

    this.#sendResult(id, result);
  }

  /**
   * Send a successful result back to papi
   */
  #sendResult(id: number, result: unknown): void {
    const response = JSON.stringify({ jsonrpc: '2.0', id, result });

    this.#messageHandler?.(response);
  }

  /**
   * Send an error response back to papi
   */
  #sendError(id: number, message: string): void {
    const response = JSON.stringify({
      jsonrpc: '2.0',
      id,
      error: { code: -32603, message },
    });

    this.#messageHandler?.(response);
  }

  /**
   * Send a subscription notification to papi
   */
  #sendNotification(
    method: string,
    subscription: string | number,
    result: unknown,
  ): void {
    const notification = JSON.stringify({
      jsonrpc: '2.0',
      method,
      params: { subscription, result },
    });

    this.#messageHandler?.(notification);
  }

  /**
   * Handle disconnect from papi.
   * Cleans up handlers but does NOT disconnect the shared WebSocket.
   */
  #handleDisconnect(): void {
    this.#messageHandler = null;
  }
}
