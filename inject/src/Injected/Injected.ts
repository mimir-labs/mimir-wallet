// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Injected } from '@polkadot/extension-inject/types';
import type { SendRequest } from './types';

import Accounts from './Accounts';
import Metadata from './Metadata';
import PostMessageProvider from './PostMessageProvider';
import Signer from './Signer';

export default class implements Injected {
  public readonly accounts: Accounts;

  public readonly metadata: Metadata;

  public readonly provider: PostMessageProvider;

  public readonly signer: Signer;

  constructor(sendRequest: SendRequest) {
    this.accounts = new Accounts(sendRequest);
    this.metadata = new Metadata(sendRequest);
    this.provider = new PostMessageProvider(sendRequest);
    this.signer = new Signer(sendRequest);

    setInterval((): void => {
      sendRequest('pub(ping)', null).catch((): void => {
        console.error('Extension unavailable, ping failed');
      });
    }, 5_000 + Math.floor(Math.random() * 5_000));
  }
}
