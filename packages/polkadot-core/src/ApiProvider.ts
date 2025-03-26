// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type {
  EndpointStats,
  JsonRpcResponse,
  ProviderInterface,
  ProviderInterfaceCallback,
  ProviderInterfaceEmitCb,
  ProviderInterfaceEmitted,
  ProviderStats
} from '@polkadot/rpc-provider/types';

import { RpcCoder } from '@polkadot/rpc-provider/coder';
import { LRUCache } from '@polkadot/rpc-provider/lru';
import { getWSErrorString } from '@polkadot/rpc-provider/ws/errors';
import { isNull, isUndefined, noop, objectSpread, stringify } from '@polkadot/util';
import { WebSocket } from '@polkadot/x-ws';
import { EventEmitter } from 'eventemitter3';

interface SubscriptionHandler {
  callback: ProviderInterfaceCallback;
  type: string;
}

interface WsStateAwaiting {
  callback: ProviderInterfaceCallback;
  method: string;
  params: unknown[];
  start: number;
  subscription?: SubscriptionHandler | undefined;
}

interface WsStateSubscription extends SubscriptionHandler {
  method: string;
  params: unknown[];
}

const ALIASES: Record<string, string> = {
  chain_finalisedHead: 'chain_finalizedHead',
  chain_subscribeFinalisedHeads: 'chain_subscribeFinalizedHeads',
  chain_unsubscribeFinalisedHeads: 'chain_unsubscribeFinalizedHeads'
};

const RETRY_DELAY = 2_500;

const DEFAULT_TIMEOUT_MS = 60 * 1000;
const TIMEOUT_INTERVAL = 5_000;

/** @internal Clears a Record<*> of all keys, optionally with all callback on clear */
function eraseRecord<T>(record: Record<string, T>, cb?: (item: T) => void): void {
  Object.keys(record).forEach((key): void => {
    if (cb) {
      cb(record[key]);
    }

    delete record[key];
  });
}

/** @internal Creates a default/empty stats object */
function defaultEndpointStats(): EndpointStats {
  return { bytesRecv: 0, bytesSent: 0, cached: 0, errors: 0, requests: 0, subscriptions: 0, timeout: 0 };
}

export class ApiProvider implements ProviderInterface {
  readonly #callCache: LRUCache;
  readonly #coder: RpcCoder;
  readonly #endpoints: string[];
  readonly #http?: string;
  readonly #eventemitter: EventEmitter;
  readonly #handlers: Record<string, WsStateAwaiting> = {};
  readonly #isReadyPromise: Promise<ApiProvider>;
  readonly #stats: ProviderStats;
  readonly #waitingForId: Record<string, JsonRpcResponse<unknown>> = {};
  readonly #cacheCapacity: number;

  #autoConnectMs: number;
  #endpointIndex: number;
  #endpointStats: EndpointStats;
  #isWsConnected = false;
  #subscriptions: Record<string, WsStateSubscription> = {};
  #timeoutId?: ReturnType<typeof setInterval> | null = null;
  #websocket: WebSocket | null;
  #timeout: number;

  constructor(
    endpoints: string | string[],
    http?: string,
    autoConnectMs: number | false = RETRY_DELAY,
    timeout?: number,
    cacheCapacity = 1024
  ) {
    endpoints = Array.isArray(endpoints) ? endpoints : [endpoints];

    if (endpoints.length === 0) {
      throw new Error('ApiProvider requires at least one Endpoint');
    }

    endpoints.forEach((endpoint) => {
      if (!/^(wss|ws):\/\//.test(endpoint)) {
        throw new Error(`Endpoint should start with 'ws://', received '${endpoint}'`);
      }
    });
    this.#callCache = new LRUCache(cacheCapacity);
    this.#cacheCapacity = cacheCapacity;
    this.#eventemitter = new EventEmitter();
    this.#autoConnectMs = autoConnectMs || 0;
    this.#coder = new RpcCoder();
    this.#endpointIndex = -1;
    this.#endpoints = endpoints;
    this.#http = http;
    this.#websocket = null;
    this.#stats = {
      active: { requests: 0, subscriptions: 0 },
      total: defaultEndpointStats()
    };
    this.#endpointStats = defaultEndpointStats();
    this.#timeout = timeout || DEFAULT_TIMEOUT_MS;

    this.connectWithRetry().catch(noop);

    this.#isReadyPromise = new Promise((resolve): void => {
      this.#eventemitter.once('connected', (): void => {
        resolve(this);
      });
    });
  }

  /**
   * @summary `true` when this provider supports subscriptions
   */
  public get hasSubscriptions(): boolean {
    return !!true;
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
    return true;
  }

  public get endpoint(): string {
    return this.#endpoints[this.#endpointIndex];
  }

  /**
   * @description Returns a clone of the object
   */
  public clone(): ApiProvider {
    return new ApiProvider(this.#endpoints);
  }

  protected selectEndpointIndex(endpoints: string[]): number {
    return (this.#endpointIndex + 1) % endpoints.length;
  }

  public async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.#websocket) {
        throw new Error('WebSocket is already connected');
      }

      try {
        this.#endpointIndex = this.selectEndpointIndex(this.#endpoints);

        // the as here is Deno-specific - not available on the globalThis
        this.#websocket = new WebSocket(this.endpoint, []);

        if (this.#websocket) {
          this.#websocket.onclose = this.#onSocketClose;
          this.#websocket.onmessage = this.#onSocketMessage;

          this.#websocket.onerror = (event) => {
            console.error('websocket error', this.endpoint, event);
            reject(event);
          };

          this.#websocket.onopen = () => {
            resolve();
            this.#onSocketOpen();
          };
        }

        // timeout any handlers that have not had a response
        this.#timeoutId = setInterval(() => this.#timeoutHandlers(), TIMEOUT_INTERVAL);
      } catch (error) {
        console.error(error);

        this.#emit('error', error);

        throw error;
      }
    });
  }

  /**
   * @description Connect, never throwing an error, but rather forcing a retry
   */
  public async connectWithRetry(): Promise<void> {
    if (this.#autoConnectMs > 0) {
      try {
        await this.connect();
      } catch {
        setTimeout((): void => {
          if (this.#websocket) {
            this.#websocket.onclose = null;
            this.#websocket.onerror = null;
            this.#websocket.onmessage = null;
            this.#websocket.onopen = null;
            this.#websocket = null;
          }

          this.connectWithRetry().catch(noop);
        }, this.#autoConnectMs);
      }
    }
  }

  /**
   * @description Manually disconnect from the connection, clearing auto-connect logic
   */

  public async disconnect(): Promise<void> {
    // switch off autoConnect, we are in manual mode now
    this.#autoConnectMs = 0;

    try {
      if (this.#websocket) {
        // 1000 - Normal closure; the connection successfully completed
        this.#websocket.close(1000);
      }
    } catch (error) {
      console.error(this.endpoint, error);

      this.#emit('error', error);

      throw error;
    }
  }

  /**
   * @description Returns the connection stats
   */
  public get stats(): ProviderStats {
    return {
      active: {
        requests: Object.keys(this.#handlers).length,
        subscriptions: Object.keys(this.#subscriptions).length
      },
      total: this.#stats.total
    };
  }

  public get endpointStats(): EndpointStats {
    return this.#endpointStats;
  }

  /**
   * @summary Listens on events after having subscribed using the [[subscribe]] function.
   * @param  {ProviderInterfaceEmitted} type Event
   * @param  {ProviderInterfaceEmitCb}  sub  Callback
   * @return unsubscribe function
   */
  public on(type: ProviderInterfaceEmitted, sub: ProviderInterfaceEmitCb): () => void {
    this.#eventemitter.on(type, sub);

    return (): void => {
      this.#eventemitter.removeListener(type, sub);
    };
  }

  /**
   * @summary Send JSON data using WebSockets to configured HTTP Endpoint or queue.
   * @param method The RPC methods to execute
   * @param params Encoded parameters as applicable for the method
   * @param subscription Subscription details (internally used)
   */
  public send<T = any>(
    method: string,
    params: unknown[],
    isCacheable?: boolean,
    subscription?: SubscriptionHandler
  ): Promise<T> {
    this.#endpointStats.requests++;
    this.#stats.total.requests++;

    const [id, body] = this.#coder.encodeJson(method, params);

    if (this.#cacheCapacity === 0) {
      return this.#send(id, body, method, params, subscription);
    }

    const cacheKey = isCacheable ? `${method}::${stringify(params)}` : '';
    let resultPromise: Promise<T> | null = isCacheable ? this.#callCache.get(cacheKey) : null;

    if (!resultPromise) {
      resultPromise = this.#send(id, body, method, params, subscription);

      if (isCacheable) {
        this.#callCache.set(cacheKey, resultPromise);
      }
    } else {
      this.#endpointStats.cached++;
      this.#stats.total.cached++;
    }

    return resultPromise;
  }

  async #wsSend<T>(
    id: number,
    body: string,
    method: string,
    params: unknown[],
    subscription?: SubscriptionHandler
  ): Promise<T> {
    await this.#isReadyPromise;

    return new Promise<T>((resolve, reject): void => {
      try {
        if (!this.#isWsConnected || this.#websocket === null) {
          throw new Error('WebSocket is not connected');
        }

        const callback = (error?: Error | null, result?: T): void => {
          error ? reject(error) : resolve(result as T);
        };

        this.#handlers[id] = {
          callback,
          method,
          params,
          start: Date.now(),
          subscription
        };

        const bytesSent = body.length;

        this.#endpointStats.bytesSent += bytesSent;
        this.#stats.total.bytesSent += bytesSent;

        this.#websocket.send(body);
      } catch (error) {
        this.#endpointStats.errors++;
        this.#stats.total.errors++;

        reject(error);
      }
    });
  }

  async #httpSend<T>(body: string, httpUrl: string): Promise<T> {
    this.#stats.total.requests++;

    this.#stats.active.requests++;
    this.#stats.total.bytesSent += body.length;

    try {
      const response = await fetch(httpUrl, {
        keepalive: true,
        body,
        headers: {
          Accept: 'application/json',
          'Content-Length': `${body.length}`,
          'Content-Type': 'application/json'
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

  async #send<T>(
    id: number,
    body: string,
    method: string,
    params: unknown[],
    subscription?: SubscriptionHandler
  ): Promise<T> {
    const httpUrl = this.#http;

    if (!subscription && !this.#isWsConnected && httpUrl) {
      return this.#httpSend(body, httpUrl);
    }

    return this.#wsSend(id, body, method, params, subscription);
  }

  public subscribe(
    type: string,
    method: string,
    params: unknown[],
    callback: ProviderInterfaceCallback
  ): Promise<number | string> {
    this.#endpointStats.subscriptions++;
    this.#stats.total.subscriptions++;

    // subscriptions are not cached, LRU applies to .at(<blockHash>) only
    return this.send<number | string>(method, params, false, { callback, type });
  }

  /**
   * @summary Allows unsubscribing to subscriptions made with [[subscribe]].
   */
  public async unsubscribe(type: string, method: string, id: number | string): Promise<boolean> {
    const subscription = `${type}::${id}`;

    // FIXME This now could happen with re-subscriptions. The issue is that with a re-sub
    // the assigned id now does not match what the API user originally received. It has
    // a slight complication in solving - since we cannot rely on the send id, but rather
    // need to find the actual subscription id to map it
    if (isUndefined(this.#subscriptions[subscription])) {
      return false;
    }

    delete this.#subscriptions[subscription];

    try {
      return this.isConnected && !isNull(this.#websocket) ? this.send<boolean>(method, [id]) : true;
    } catch {
      return false;
    }
  }

  #emit = (type: ProviderInterfaceEmitted, ...args: unknown[]): void => {
    this.#eventemitter.emit(type, ...args);
  };

  #onSocketClose = (event: CloseEvent): void => {
    const error = new Error(
      `disconnected from ${this.endpoint}: ${event.code}:: ${event.reason || getWSErrorString(event.code)}`
    );

    if (this.#autoConnectMs > 0) {
      console.error(error.message);
    }

    this.#isWsConnected = false;

    if (this.#websocket) {
      this.#websocket.onclose = null;
      this.#websocket.onerror = null;
      this.#websocket.onmessage = null;
      this.#websocket.onopen = null;
      this.#websocket = null;
    }

    if (this.#timeoutId) {
      clearInterval(this.#timeoutId);
      this.#timeoutId = null;
    }

    // reject all hanging requests
    eraseRecord(this.#handlers, (h) => {
      try {
        h.callback(error, undefined);
      } catch (err) {
        // does not throw
        console.error(err);
      }
    });
    eraseRecord(this.#waitingForId);

    // Reset stats for active endpoint
    this.#endpointStats = defaultEndpointStats();

    this.#emit('disconnected');

    if (this.#autoConnectMs > 0) {
      setTimeout((): void => {
        this.connectWithRetry().catch(noop);
      }, this.#autoConnectMs);
    }
  };

  #onSocketMessage = (message: MessageEvent): void => {
    const bytesRecv = message.data.length;

    this.#endpointStats.bytesRecv += bytesRecv;
    this.#stats.total.bytesRecv += bytesRecv;

    const response = JSON.parse(message.data) as JsonRpcResponse<string>;

    return isUndefined(response.method)
      ? this.#onSocketMessageResult(response)
      : this.#onSocketMessageSubscribe(response);
  };

  #onSocketMessageResult = (response: JsonRpcResponse<string>): void => {
    const handler = this.#handlers[response.id];

    if (!handler) {
      return;
    }

    try {
      const { method, params, subscription } = handler;
      const result = this.#coder.decodeResponse<string>(response);

      // first send the result - in case of subs, we may have an update
      // immediately if we have some queued results already
      handler.callback(null, result);

      if (subscription) {
        const subId = `${subscription.type}::${result}`;

        this.#subscriptions[subId] = objectSpread({}, subscription, {
          method,
          params
        });

        // if we have a result waiting for this subscription already
        if (this.#waitingForId[subId]) {
          this.#onSocketMessageSubscribe(this.#waitingForId[subId]);
        }
      }
    } catch (error) {
      this.#endpointStats.errors++;
      this.#stats.total.errors++;

      handler.callback(error as Error, undefined);
    }

    delete this.#handlers[response.id];
  };

  #onSocketMessageSubscribe = (response: JsonRpcResponse<unknown>): void => {
    if (!response.method) {
      throw new Error('No method found in JSONRPC response');
    }

    const method = ALIASES[response.method] || response.method;
    const subId = `${method}::${response.params.subscription}`;
    const handler = this.#subscriptions[subId];

    if (!handler) {
      // store the JSON, we could have out-of-order subid coming in
      this.#waitingForId[subId] = response;

      return;
    }

    // housekeeping
    delete this.#waitingForId[subId];

    try {
      const result = this.#coder.decodeResponse(response);

      handler.callback(null, result);
    } catch (error) {
      this.#endpointStats.errors++;
      this.#stats.total.errors++;

      handler.callback(error as Error, undefined);
    }
  };

  #onSocketOpen = (): boolean => {
    if (this.#websocket === null) {
      throw new Error('WebSocket cannot be null in onOpen');
    }

    this.#isWsConnected = true;

    this.#resubscribe();

    this.#emit('connected');

    return true;
  };

  #resubscribe = (): void => {
    const subscriptions = this.#subscriptions;

    this.#subscriptions = {};

    Promise.all(
      Object.keys(subscriptions).map(async (id): Promise<void> => {
        const { callback, method, params, type } = subscriptions[id];

        // only re-create subscriptions which are not in author (only area where
        // transactions are created, i.e. submissions such as 'author_submitAndWatchExtrinsic'
        // are not included (and will not be re-broadcast)
        if (type.startsWith('author_')) {
          return;
        }

        try {
          await this.subscribe(type, method, params, callback);
        } catch (error) {
          console.error(error);
        }
      })
    ).catch(console.error);
  };

  #timeoutHandlers = (): void => {
    const now = Date.now();
    const ids = Object.keys(this.#handlers);

    for (let i = 0, count = ids.length; i < count; i++) {
      const handler = this.#handlers[ids[i]];

      if (now - handler.start > this.#timeout) {
        try {
          handler.callback(new Error(`No response received from RPC endpoint in ${this.#timeout / 1000}s`), undefined);
        } catch {
          // ignore
        }

        this.#endpointStats.timeout++;
        this.#stats.total.timeout++;
        delete this.#handlers[ids[i]];
      }
    }
  };
}
