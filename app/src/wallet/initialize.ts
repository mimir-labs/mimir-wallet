// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { WalletAccount } from './types';

import { walletConfig } from '@/config';
import { CONNECT_ORIGIN, CONNECTED_WALLETS_KEY } from '@/constants';
import { documentReadyPromise } from '@/utils/document';

import { store } from '@mimir-wallet/service';

import { useWallet } from './useWallet';
import { enableWallet, loadWallet } from './utils';

async function _initialize(wallet: string) {
  if (window.injectedWeb3?.[walletConfig[wallet]?.key || '']) {
    const injected = await enableWallet(wallet, CONNECT_ORIGIN);

    return loadWallet(injected, wallet);
  }

  return [];
}

export async function initializeWallet() {
  const connectWallets: string[] = (store.get(CONNECTED_WALLETS_KEY) as string[]) || [];

  const promises: Promise<WalletAccount[]>[] = [];

  // Ensure document is ready before proceeding
  await documentReadyPromise();

  // Attempt to reconnect to previously connected wallets
  for (const wallet of connectWallets) {
    promises.push(_initialize(wallet));
  }

  const data = (await Promise.all(promises)).flat();

  // Update store with initialized wallet data
  useWallet.setState({
    isWalletReady: true,
    walletAccounts: data,
    wallets: window.injectedWeb3 || {}
  });
}
