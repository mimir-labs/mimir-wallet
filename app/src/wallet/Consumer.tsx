// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { InjectedAccount } from '@polkadot/extension-inject/types';
import type { WalletAccount } from './types';

import { walletConfig } from '@/config';
import { CONNECT_ORIGIN } from '@/constants';
import { useEffect } from 'react';

import { encodeAddress } from '@mimir-wallet/polkadot-core';

import { useWallet } from './useWallet';

function combineWalletAccounts(
  walletAccounts: WalletAccount[],
  source: string,
  accounts: InjectedAccount[]
): WalletAccount[] {
  return walletAccounts
    .filter((account) => account.source !== source)
    .concat(
      accounts.map((account) => ({
        address: encodeAddress(account.address),
        name: account.name,
        type: account.type,
        source
      }))
    );
}

function WalletConsumer() {
  const { connectedWallets } = useWallet();

  useEffect(() => {
    const unsubscribes: Promise<() => void>[] = [];

    for (const wallet of connectedWallets) {
      const key = walletConfig[wallet]?.key;

      if (key && window.injectedWeb3?.[key]) {
        unsubscribes.push(
          window.injectedWeb3[key].enable(CONNECT_ORIGIN).then((injected) => {
            return injected.accounts.subscribe((accounts) => {
              useWallet.setState(({ walletAccounts }) => ({
                walletAccounts: combineWalletAccounts(walletAccounts, wallet, accounts),
                wallets: window.injectedWeb3
              }));
            });
          })
        );
      }
    }

    return () => {
      unsubscribes.forEach((unsubscribe) => unsubscribe.then((fn) => fn()));
    };
  }, [connectedWallets]);

  return null;
}

export default WalletConsumer;
