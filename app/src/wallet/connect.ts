// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { walletConfig } from '@/config';
import { CONNECT_ORIGIN, CONNECTED_WALLETS_KEY } from '@/constants';

import { addressEq } from '@mimir-wallet/polkadot-core';
import { store } from '@mimir-wallet/service';

import { useWallet } from './useWallet';
import { loadWallet } from './utils';

/**
 * Connect to a specific wallet by name
 * @param name - The name of the wallet to connect
 */
export async function connectWallet(name: string) {
  const provider = window.injectedWeb3?.[walletConfig[name]?.key];

  if (provider) {
    const walletAccounts = await loadWallet(await provider.enable(CONNECT_ORIGIN), name);

    useWallet.setState((state) => {
      const newValue = [...state.connectedWallets, name];

      // Persist connected wallets to storage
      store.set(CONNECTED_WALLETS_KEY, newValue);

      // Deduplicate wallet accounts by address
      const uniqueWalletAccounts = [...state.walletAccounts, ...walletAccounts].filter(
        (account, index, self) => !self.some((t, i) => i < index && addressEq(t.address, account.address))
      );

      return {
        ...state,
        connectedWallets: newValue,
        walletAccounts: uniqueWalletAccounts
      };
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
