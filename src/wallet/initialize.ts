// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { WalletAccount } from './types';

import { walletConfig } from '@mimir-wallet/config';
import { CONNECT_ORIGIN, CONNECTED_WALLETS_KEY } from '@mimir-wallet/constants';
import { documentReadyPromise } from '@mimir-wallet/utils/document';
import { store } from '@mimir-wallet/utils/store';

import { useWallet } from './useWallet';
import { loadWallet } from './utils';

export async function initializeWallet() {
  const connectWallets: string[] = (store.get(CONNECTED_WALLETS_KEY) as string[]) || [];

  const promises: Promise<WalletAccount[]>[] = [];

  // Ensure document is ready before proceeding
  await documentReadyPromise();

  // Attempt to reconnect to previously connected wallets
  for (const wallet of connectWallets) {
    if (window.injectedWeb3?.[walletConfig[wallet]?.key || '']) {
      promises.push(loadWallet(window.injectedWeb3[walletConfig[wallet].key], CONNECT_ORIGIN, wallet));
    }
  }

  const data = (await Promise.all(promises)).flat();

  // Update store with initialized wallet data
  useWallet.setState({
    isWalletReady: true,
    walletAccounts: data,
    wallets: window.injectedWeb3 || {}
  });
}
