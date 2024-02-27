// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { InjectedWindowProvider, WalletState } from './types';

import { ConnectWalletModal } from '@mimir-wallet/components';
import { CONNECTED_WALLETS_KEY } from '@mimir-wallet/constants';
import { loadWallet } from '@mimir-wallet/utils';
import keyring from '@polkadot/ui-keyring';
import React, { useEffect, useState } from 'react';
import store from 'store';

import { useEagerConnect } from '../useEagerConnect';
import { useSyncMultisigs } from '../useMultisigs';
import { useToggle } from '../useToggle';

interface Props {
  children?: React.ReactNode;
}

export function documentReadyPromise(): Promise<void> {
  return new Promise((resolve): void => {
    if (document.readyState === 'complete') {
      resolve();
    } else {
      window.addEventListener('load', () => resolve());
    }
  });
}

export const WalletCtx = React.createContext<WalletState>({} as WalletState);

export function WalletCtxRoot({ children }: Props): React.ReactElement<Props> {
  const [walletOpen, , setOpen] = useToggle();
  const [wallets, setWallets] = useState<Record<string, InjectedWindowProvider>>({});
  const [connectedWallets, setConnectedWallets] = useState<string[]>(store.get(CONNECTED_WALLETS_KEY) || []);
  const isWalletReady = useEagerConnect();
  const isMultisigSyned = useSyncMultisigs(isWalletReady);

  useEffect(() => {
    documentReadyPromise().then(() => {
      if (window.injectedWeb3) {
        setWallets(window.injectedWeb3);
      }

      setTimeout(() => {
        if (window.injectedWeb3) {
          setWallets(window.injectedWeb3);
        }
      }, 1000);
    });
  }, []);
  const openWallet = () => setOpen(true);
  const closeWallet = () => setOpen(false);

  const connect = async (name: string) => {
    const provider = window.injectedWeb3?.[name];

    if (provider) {
      await loadWallet(provider, 'mimir-wallet', name);
      setConnectedWallets((values) => {
        const newValue = [...values, name];

        store.set(CONNECTED_WALLETS_KEY, newValue);

        return newValue;
      });
    }
  };

  const disconnect = (name: string) => {
    keyring.getPairs().forEach((item) => {
      if (item.meta.source === name) {
        keyring.forgetAccount(item.address);
      }
    });
    setConnectedWallets((values) => {
      const newValue = values.filter((item) => item !== name);

      store.set(CONNECTED_WALLETS_KEY, newValue);

      return newValue;
    });
  };

  return (
    <WalletCtx.Provider value={{ isWalletReady, isMultisigSyned, openWallet, connect, disconnect, wallets, connectedWallets, walletOpen, closeWallet }}>
      {children}
      <ConnectWalletModal onClose={closeWallet} open={walletOpen} />
    </WalletCtx.Provider>
  );
}
