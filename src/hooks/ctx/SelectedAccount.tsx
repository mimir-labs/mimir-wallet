// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { SELECT_ACCOUNT_KEY } from '@mimir-wallet/constants';
import { keyring } from '@polkadot/ui-keyring';
import { hexToU8a, isHex, u8aToHex } from '@polkadot/util';
import React, { useCallback, useEffect, useState } from 'react';
import store from 'store';

import { useAccounts } from '../useAccounts';
import { useApi } from '../useApi';
import { useWallet } from '../useWallet';

interface Props {
  children?: React.ReactNode;
}

interface State {
  selected?: string;
  selectAccount: (address: string) => void;
  isAccountReady: boolean;
}

export const SelectAccountCtx = React.createContext<State>({} as State);

function getSelected(hex?: string): string | undefined {
  if (hex) {
    return keyring.getAccount(hexToU8a(hex))?.address;
  } else {
    return keyring.getAccounts().find((item) => item.meta.isValid && item.meta.isMultisig)?.address || keyring.getAccounts()[0]?.address;
  }
}

export function SelectAccountCtxRoot({ children }: Props): React.ReactElement<Props> {
  const { isApiReady } = useApi();
  const [selected, setSelected] = useState<string | undefined>();
  const [isAccountReady] = useState(false);
  const { isWalletReady } = useWallet();
  const { allAccounts } = useAccounts();

  useEffect(() => {
    if (isApiReady && isWalletReady) {
      const stored = store.get(SELECT_ACCOUNT_KEY);

      const address = getSelected(stored);

      if (address) {
        setSelected(address);
        store.set(SELECT_ACCOUNT_KEY, u8aToHex(keyring.decodeAddress(address)));
      } else {
        const address = getSelected();

        if (address) {
          setSelected(address);
          store.set(SELECT_ACCOUNT_KEY, u8aToHex(keyring.decodeAddress(address)));
        } else {
          setSelected(undefined);
          store.remove(SELECT_ACCOUNT_KEY);
        }
      }
    }
  }, [allAccounts, isApiReady, isWalletReady]);

  const selectAccount = useCallback((address: string) => {
    const account = keyring.getAccount(isHex(address) ? hexToU8a(address) : address);

    if (account) {
      const hex = u8aToHex(account.publicKey);

      store.set(SELECT_ACCOUNT_KEY, hex);
      setSelected(getSelected(hex));
    }
  }, []);

  return <SelectAccountCtx.Provider value={{ selected, selectAccount, isAccountReady }}>{children}</SelectAccountCtx.Provider>;
}
