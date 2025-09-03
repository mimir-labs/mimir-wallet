// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { InjectedAccount } from '@polkadot/extension-inject/types';
import type { WalletAccount } from './types';

import { walletConfig } from '@/config';
import { CONNECT_ORIGIN } from '@/constants';
import { useEffect } from 'react';

import { addressEq, encodeAddress, useApi } from '@mimir-wallet/polkadot-core';

import { useWallet } from './useWallet';

function combineWalletAccounts(
  walletAccounts: WalletAccount[],
  source: string,
  accounts: InjectedAccount[],
  chainSS58: number
): WalletAccount[] {
  return walletAccounts
    .filter((account) => account.source !== source)
    .concat(
      accounts.map((account) => ({
        address: encodeAddress(account.address, chainSS58),
        name: account.name,
        type: account.type,
        source
      }))
    );
}

function WalletConsumer() {
  const { connectedWallets } = useWallet();
  const { chainSS58 } = useApi();

  useEffect(() => {
    const unsubscribes: Promise<() => void>[] = [];

    for (const wallet of connectedWallets) {
      const key = walletConfig[wallet]?.key;

      if (key && window.injectedWeb3?.[key]) {
        unsubscribes.push(
          window.injectedWeb3[key].enable(CONNECT_ORIGIN).then((injected) => {
            return injected.accounts.subscribe((accounts) => {
              useWallet.setState(({ walletAccounts }) => ({
                // Deduplicate wallet accounts by address
                walletAccounts: combineWalletAccounts(walletAccounts, wallet, accounts, chainSS58).filter(
                  (account, index, self) => !self.some((t, i) => i < index && addressEq(t.address, account.address))
                ),
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
  }, [connectedWallets, chainSS58]);

  return null;
}

export default WalletConsumer;
