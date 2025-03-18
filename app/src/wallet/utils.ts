// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Injected } from '@polkadot/extension-inject/types';

import { walletConfig } from '@/config';
import { documentReadyPromise } from '@/utils/document';

import { encodeAddress } from '@mimir-wallet/polkadot-core';

export async function loadWallet(injected: Injected, source: string) {
  try {
    const accounts = await injected.accounts.get(true);

    return accounts.map(({ address, name, type }) => {
      return { address: encodeAddress(address), name, type, source };
    });
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

    const injected = await window.injectedWeb3[walletConfig[source].key].enable(origin);

    return injected;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
