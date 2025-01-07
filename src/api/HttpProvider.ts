// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { JsonRpcResponse, ProviderInterface, ProviderStats } from '@polkadot/rpc-provider/types';

import { RpcCoder } from '@polkadot/rpc-provider/coder';
import { LRUCache } from '@polkadot/rpc-provider/lru';
import { logger, noop, stringify } from '@polkadot/util';

const ERROR_SUBSCRIBE = 'HTTP Provider does not have subscriptions, use WebSockets instead';

const l = logger('api-http');

export class HttpProvider implements ProviderInterface {
  readonly #callCache: LRUCache;
  readonly #cacheCapacity: number;
  readonly #coder: RpcCoder;
  readonly #endpoint: string;
  readonly #headers: Record<string, string>;
  readonly #stats: ProviderStats;

  /**
   * @param {string} endpoint The endpoint url starting with http://
   */
  constructor(endpoint: string, headers: Record<string, string> = {}, cacheCapacity = 1024) {
    if (!/^(https|http):\/\//.test(endpoint)) {
      throw new Error(`Endpoint should start with 'http://' or 'https://', received '${endpoint}'`);
    }

    this.#coder = new RpcCoder();
    this.#endpoint = endpoint;
    this.#headers = headers;
    this.#callCache = new LRUCache(cacheCapacity === 0 ? 0 : cacheCapacity);
    this.#cacheCapacity = cacheCapacity === 0 ? 0 : cacheCapacity;

    this.#stats = {
      active: { requests: 0, subscriptions: 0 },
      total: { bytesRecv: 0, bytesSent: 0, cached: 0, errors: 0, requests: 0, subscriptions: 0, timeout: 0 }
    };
  }

  /**
   * @summary `true` when this provider supports subscriptions
   */
  public get hasSubscriptions(): boolean {
    return !!false;
  }

  /**
   * @description Returns a clone of the object
   */
  public clone(): HttpProvider {
    return new HttpProvider(this.#endpoint, this.#headers);
  }

  /**
   * @description Manually connect from the connection
   */
  public async connect(): Promise<void> {
    // noop
  }

  /**
   * @description Manually disconnect from the connection
   */
  public async disconnect(): Promise<void> {
    // noop
  }

  /**
   * @description Returns the connection stats
   */
  public get stats(): ProviderStats {
    return this.#stats;
  }

  /**
   * @summary `true` when this provider supports clone()
   */
  public get isClonable(): boolean {
    return !!true;
  }

  /**
   * @summary Whether the node is connected or not.
   * @return {boolean} true if connected
   */
  public get isConnected(): boolean {
    return !!true;
  }

  public on(): () => void {
    l.error("HTTP Provider does not have 'on' emitters, use WebSockets instead");

    return noop;
  }

  public async send<T>(method: string, params: unknown[], isCacheable?: boolean): Promise<T> {
    this.#stats.total.requests++;

    const [, body] = this.#coder.encodeJson(method, params);

    if (this.#cacheCapacity === 0) {
      return this.#send(body);
    }

    const cacheKey = isCacheable ? `${method}::${stringify(params)}` : '';
    let resultPromise: Promise<T> | null = isCacheable ? this.#callCache.get(cacheKey) : null;

    if (!resultPromise) {
      resultPromise = this.#send(body);

      if (isCacheable) {
        this.#callCache.set(cacheKey, resultPromise);
      }
    } else {
      this.#stats.total.cached++;
    }

    return resultPromise;
  }

  async #send<T>(body: string): Promise<T> {
    this.#stats.active.requests++;
    this.#stats.total.bytesSent += body.length;

    try {
      const response = await fetch(this.#endpoint, {
        keepalive: true,
        body,
        headers: {
          Accept: 'application/json',
          'Content-Length': `${body.length}`,
          'Content-Type': 'application/json',
          ...this.#headers
        },
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error(`[${response.status}]: ${response.statusText}`);
      }

      const result = await response.text();

      this.#stats.total.bytesRecv += result.length;

      const decoded = this.#coder.decodeResponse<T>(JSON.parse(result) as JsonRpcResponse<T>);

      this.#stats.active.requests--;

      return decoded;
    } catch (e) {
      this.#stats.active.requests--;
      this.#stats.total.errors++;

      throw e;
    }
  }

  public subscribe(): Promise<number> {
    l.error(ERROR_SUBSCRIBE);

    throw new Error(ERROR_SUBSCRIBE);
  }

  public unsubscribe(): Promise<boolean> {
    l.error(ERROR_SUBSCRIBE);

    throw new Error(ERROR_SUBSCRIBE);
  }
}
