// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Injected } from '@polkadot/extension-inject/types';

import { walletConfig } from '@/config';
import { sleep } from '@/utils';
import { documentReadyPromise } from '@/utils/document';

export async function loadWallet(injected: Injected, source: string) {
  try {
    const accounts = await injected.accounts.get(true);

    return accounts
      .map(({ address, name, type }) => {
        return { address: address, name, type, source };
      })
      .filter(({ type }) => type === 'ed25519' || type === 'sr25519');
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function enableWallet(source: string, origin: string) {
  try {
    if (!window.injectedWeb3?.[walletConfig[source].key]) {
      throw new Error('No injected web3');
    }

    await documentReadyPromise();

    await sleep(50);

    const injected = await window.injectedWeb3[walletConfig[source].key].enable(origin);

    return injected;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
