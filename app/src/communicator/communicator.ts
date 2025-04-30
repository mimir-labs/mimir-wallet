// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { MessageTypes, ResponseTypes, TransportRequestMessage } from '@polkadot/extension-base/background/types';
import type { SignerPayloadJSON } from '@polkadot/types/types';
import type { HexString } from '@polkadot/util/types';
import type { MutableRefObject } from 'react';
import type { State } from './types';

import { assert } from '@polkadot/util';

import { allEndpoints } from '@mimir-wallet/polkadot-core';
import { service } from '@mimir-wallet/service';

declare module '@polkadot/extension-base/background/types' {
  export interface RequestSignatures {
    'pub(call.get)': [HexString, HexString];
  }
}

export abstract class Communicator {
  #state: MutableRefObject<State>;

  constructor(state: MutableRefObject<State>) {
    this.#state = state;
  }

  public abstract sendMessage(id: string, response?: unknown, subscription?: unknown): void;

  public async handle<TMessageType extends MessageTypes>({
    id,
    message: type,
    request
  }: TransportRequestMessage<TMessageType>): Promise<ResponseTypes[keyof ResponseTypes]> {
    // if (type === 'pub(phishing.redirectIfDenied)') {
    //   return this.redirectIfPhishing(url);
    // }

    // if (type !== 'pub(authorize.tab)') {
    //   this.#state.ensureUrlAuthorized(url);
    // }

    switch (type) {
      case 'pub(authorize.tab)':
        return {
          result: true,
          authorizedAccounts: this.#state.current.getAccounts().map((item) => item.address)
        };

      case 'pub(accounts.list)':
        return this.#state.current.getAccounts();

      case 'pub(accounts.subscribe)':
        setTimeout(() => {
          this.sendMessage(id, undefined, this.#state.current.getAccounts());
        }, 100);

        return id;

      case 'pub(accounts.unsubscribe)':
        return true;

      case 'pub(bytes.sign)':
        throw new Error('not support for sign');

      case 'pub(extrinsic.sign)':
        return this.#state.current.extrinsicSign(request as SignerPayloadJSON, id);

      case 'pub(metadata.list)':
        throw new Error('not implements');

      case 'pub(metadata.provide)':
        throw new Error('not implements');

      case 'pub(ping)':
        return true;

      case 'pub(rpc.listProviders)':
        throw new Error('not implements');

      case 'pub(rpc.send)':
        throw new Error('not implements');

      case 'pub(rpc.startProvider)':
        throw new Error('not implements');

      case 'pub(rpc.subscribe)':
        throw new Error('not implements');

      case 'pub(rpc.subscribeConnected)':
        throw new Error('not implements');

      case 'pub(rpc.unsubscribe)':
        throw new Error('not implements');

      case 'pub(call.get)':
        return this.getCall(request as HexString);

      default:
        throw new Error(`Unable to handle message of type ${type}`);
    }
  }

  private async getCall(hash: HexString): Promise<HexString> {
    const endpoint = allEndpoints.find((item) => item.genesisHash === this.#state.current.genesisHash);

    assert(endpoint, 'not support get call for current chain');

    const { data } = await service.getCalldata(endpoint.key, hash);

    return data;
  }
}
