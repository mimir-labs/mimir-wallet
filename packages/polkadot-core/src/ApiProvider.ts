// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type {
  EndpointStats,
  ProviderInterface,
  ProviderInterfaceCallback,
  ProviderInterfaceEmitCb,
  ProviderInterfaceEmitted,
  ProviderStats
} from '@polkadot/rpc-provider/types';

import { WsProvider } from '@polkadot/api';
import { EventEmitter } from 'eventemitter3';

import { HttpProvider } from './HttpProvider.js';

interface SubscriptionHandler {
  callback: ProviderInterfaceCallback;
  type: string;
}
export class ApiProvider implements ProviderInterface {
  #wsUrl: string | string[];
  #httpUrl: string;
  #eventEmitter: EventEmitter = new EventEmitter();

  #wsProvider: WsProvider;
  #httpProvider: HttpProvider;

  constructor(wsUrl: string | string[], httpUrl: string) {
    this.#wsUrl = wsUrl;
    this.#httpUrl = httpUrl;

    this.#httpProvider = new HttpProvider(httpUrl);
    this.#wsProvider = new WsProvider(wsUrl);
  }

  /**
   * @summary `true` when this provider supports subscriptions
   */
  public get hasSubscriptions(): boolean {
    return true;
  }

  /**
   * @summary `true` when this provider supports clone()
   */
  public get isClonable(): boolean {
    return true;
  }

  /**
   * @summary Whether the node is connected or not.
   * @return {boolean} true if connected
   */
  public get isConnected(): boolean {
    return true;
  }

  /**
   * @description Returns a clone of the object
   */
  public clone(): ApiProvider {
    return new ApiProvider(this.#wsUrl, this.#httpUrl);
  }

  /**
   * @summary Manually connect
   * @description The [[WsProvider]] connects automatically by default, however if you decided otherwise, you may
   * connect manually using this method.
   */

  public async connect(): Promise<void> {
    return this.#wsProvider.connect();
  }

  /**
   * @description Manually disconnect from the connection, clearing auto-connect logic
   */

  public async disconnect(): Promise<void> {
    return this.#wsProvider.disconnect();
  }

  /**
   * @description Returns the connection stats
   */
  public get stats(): ProviderStats {
    return this.#httpProvider.stats;
  }

  public get endpointStats(): EndpointStats {
    return this.#wsProvider.endpointStats;
  }

  /**
   * @summary Listens on events after having subscribed using the [[subscribe]] function.
   * @param  {ProviderInterfaceEmitted} type Event
   * @param  {ProviderInterfaceEmitCb}  sub  Callback
   * @return unsubscribe function
   */
  public on(type: ProviderInterfaceEmitted, sub: ProviderInterfaceEmitCb): () => void {
    this.#eventEmitter.on(type, sub);

    if (type === 'connected') {
      this.#eventEmitter.emit('connected');
    }

    return () => {
      this.#eventEmitter.off(type, sub);
    };
  }

  /**
   * @summary Send JSON data using WebSockets to configured HTTP Endpoint or queue.
   * @param method The RPC methods to execute
   * @param params Encoded parameters as applicable for the method
   * @param subscription Subscription details (internally used)
   */
  public async send<T = any>(
    method: string,
    params: unknown[],
    isCacheable?: boolean,
    subscription?: SubscriptionHandler
  ): Promise<T> {
    if (!subscription) {
      return new Promise((resolve, reject) => {
        let resolved = false;
        let rejects = 0;

        this.#httpProvider
          .send(method, params, isCacheable)
          .then((result) => {
            if (!resolved) {
              resolved = true;
              resolve(result as T);
            }
          })
          .catch((error) => {
            if (!rejects) {
              rejects++;
            } else {
              reject(error);
            }
          });
        this.#wsProvider.isReady
          .then((provider) => provider.send(method, params, isCacheable))
          .then((result) => {
            if (!resolved) {
              resolved = true;
              resolve(result as T);
            }
          })
          .catch((error) => {
            if (!rejects) {
              rejects++;
            } else {
              reject(error);
            }
          });
      });
    }

    return this.#wsProvider.isReady.then((provider) => {
      return provider.send(method, params, isCacheable, subscription);
    });
  }

  /**
   * @name subscribe
   * @summary Allows subscribing to a specific event.
   *
   * @example
   * <BR>
   *
   * ```javascript
   * const provider = new WsProvider('ws://127.0.0.1:9944');
   * const rpc = new Rpc(provider);
   *
   * rpc.state.subscribeStorage([[storage.system.account, <Address>]], (_, values) => {
   *   console.log(values)
   * }).then((subscriptionId) => {
   *   console.log('balance changes subscription id: ', subscriptionId)
   * })
   * ```
   */
  public subscribe(
    type: string,
    method: string,
    params: unknown[],
    callback: ProviderInterfaceCallback
  ): Promise<number | string> {
    return this.#wsProvider.isReady.then((provider) => provider.subscribe(type, method, params, callback));
  }

  /**
   * @summary Allows unsubscribing to subscriptions made with [[subscribe]].
   */
  public async unsubscribe(type: string, method: string, id: number | string): Promise<boolean> {
    return this.#wsProvider.isReady.then((provider) => provider.unsubscribe(type, method, id));
  }
}
