// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { WalletAccount, WalletState } from './types';

import { objectSpread } from '@polkadot/util';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { walletConfig } from '@mimir-wallet/config';
import { CONNECT_ORIGIN, CONNECTED_WALLETS_KEY } from '@mimir-wallet/constants';
import { addressEq, documentReadyPromise, loadWallet, store } from '@mimir-wallet/utils';

import { WalletCtx } from './context';

interface Props {
  children?: React.ReactNode;
}

const EMPTY_STATE = {
  initialized: false,
  isWalletReady: false,
  walletOpen: false,
  wallets: {},
  walletAccounts: [],
  connectedWallets: []
} as unknown as WalletState;

async function getWallet() {
  const connectWallets: string[] = (store.get(CONNECTED_WALLETS_KEY) as string[]) || [];

  const promises: Promise<WalletAccount[]>[] = [];

  await documentReadyPromise();

  for (const wallet of connectWallets) {
    if (window.injectedWeb3?.[walletConfig[wallet]?.key || '']) {
      promises.push(loadWallet(window.injectedWeb3[walletConfig[wallet].key], CONNECT_ORIGIN, wallet));
    }
  }

  const data = await Promise.all(promises);

  return data.flat();
}

export function WalletCtxRoot({ children }: Props) {
  const [walletState, setWalletState] = useState<WalletState>({
    ...EMPTY_STATE,
    walletOpen: false,
    connectedWallets: (store.get(CONNECTED_WALLETS_KEY) as string[]) || []
  });

  useEffect(() => {
    getWallet().then((walletAccounts) => {
      setWalletState((state) => ({
        ...state,
        isWalletReady: true,
        walletAccounts,
        wallets: window.injectedWeb3 || {}
      }));
    });

    setWalletState((state) => ({ ...state, initialized: true }));
  }, []);

  const connect = useCallback(async (name: string) => {
    const provider = window.injectedWeb3?.[walletConfig[name]?.key];

    if (provider) {
      const walletAccounts = await loadWallet(provider, CONNECT_ORIGIN, name);

      setWalletState((state) => {
        const newValue = [...state.connectedWallets, name];

        store.set(CONNECTED_WALLETS_KEY, newValue);

        return { ...state, connectedWallets: newValue, walletAccounts: [...state.walletAccounts, ...walletAccounts] };
      });
    }
  }, []);

  const disconnect = useCallback((name: string) => {
    setWalletState((state) => {
      const newValue = state.connectedWallets.filter((item) => item !== name);

      store.set(CONNECTED_WALLETS_KEY, newValue);

      return {
        ...state,
        connectedWallets: newValue,
        walletAccounts: state.walletAccounts.filter((item) => item.source !== name)
      };
    });
  }, []);

  const accountSource = useCallback(
    (address: string): string | undefined =>
      walletState.walletAccounts.find((item) => addressEq(item.address, address))?.source,
    [walletState.walletAccounts]
  );

  const value = useMemo<WalletState>(
    () =>
      objectSpread({}, walletState, {
        openWallet: () => setWalletState((state) => ({ ...state, walletOpen: true })),
        connect,
        disconnect,
        closeWallet: () => setWalletState((state) => ({ ...state, walletOpen: false })),
        accountSource
      }),
    [accountSource, connect, disconnect, walletState]
  );

  if (!walletState.initialized) {
    return null;
  }

  return <WalletCtx.Provider value={value}>{children}</WalletCtx.Provider>;
}
