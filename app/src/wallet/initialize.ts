// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { WalletAccount } from './types';

import { walletConfig } from '@/config';
import { CONNECT_ORIGIN, CONNECTED_WALLETS_KEY } from '@/constants';
import { documentReadyPromise } from '@/utils/document';

import { addressEq } from '@mimir-wallet/polkadot-core';
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
  let connectWallets: string[] = (store.get(CONNECTED_WALLETS_KEY) as string[]) || [];

  const promises: Promise<WalletAccount[]>[] = [];

  if (connectWallets.includes('nova') && connectWallets.includes('polkadot-js')) {
    connectWallets = connectWallets.filter((wallet) => wallet !== 'polkadot-js');
  }

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
    walletAccounts: data.filter(
      (account, index, self) => !self.some((t, i) => i < index && addressEq(t.address, account.address))
    ),
    wallets: window.injectedWeb3 || {}
  });
}
