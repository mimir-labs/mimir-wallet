// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { walletConfig } from '@/config';
import { CONNECT_ORIGIN, CONNECTED_WALLETS_KEY } from '@/constants';
import { store } from '@/utils';

import { useWallet } from './useWallet';
import { loadWallet } from './utils';

/**
 * Connect to a specific wallet by name
 * @param name - The name of the wallet to connect
 */
export async function connectWallet(name: string) {
  const provider = window.injectedWeb3?.[walletConfig[name]?.key];

  if (provider) {
    const walletAccounts = await loadWallet(provider, CONNECT_ORIGIN, name);

    useWallet.setState((state) => {
      const newValue = [...state.connectedWallets, name];

      // Persist connected wallets to storage
      store.set(CONNECTED_WALLETS_KEY, newValue);

      return { ...state, connectedWallets: newValue, walletAccounts: [...state.walletAccounts, ...walletAccounts] };
    });
  }
}

/**
 * Disconnect a specific wallet
 * @param name - The name of the wallet to disconnect
 */
export function disconnectWallet(name: string) {
  useWallet.setState((state) => {
    const newValue = state.connectedWallets.filter((item) => item !== name);

    // Update persisted wallet connections
    store.set(CONNECTED_WALLETS_KEY, newValue);

    return {
      ...state,
      connectedWallets: newValue,
      walletAccounts: state.walletAccounts.filter((item) => item.source !== name)
    };
  });
}
