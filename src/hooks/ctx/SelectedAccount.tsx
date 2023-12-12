// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { keyring } from '@polkadot/ui-keyring';
import { hexToU8a, isHex, u8aToHex } from '@polkadot/util';
import React, { useCallback, useEffect, useState } from 'react';

import { useAccounts } from '../useAccounts';
import { useApi } from '../useApi';

interface Props {
  children?: React.ReactNode;
}

interface State {
  selected?: string;
  selectAccount: (address: string) => void;
}
export const SELECT_ACCOUNT_KEY = 'selected_account';

export const SelectAccountCtx = React.createContext<State>({} as State);

function getSelected(hex: string): string | undefined {
  return keyring.getAccount(hexToU8a(hex))?.address;
}

export function SelectAccountCtxRoot({ children }: Props): React.ReactElement<Props> {
  const { isApiReady } = useApi();
  const { allAccounts } = useAccounts();
  const [selected, setSelected] = useState<string | undefined>();

  useEffect(() => {
    if (isApiReady) {
      const stored = localStorage.getItem(SELECT_ACCOUNT_KEY);

      if (stored) {
        setSelected(getSelected(stored));
      } else {
        setSelected(allAccounts[0]);
      }
    }
  }, [allAccounts, isApiReady]);

  const selectAccount = useCallback((address: string) => {
    const account = keyring.getAccount(isHex(address) ? hexToU8a(address) : address);

    if (account) {
      const hex = u8aToHex(account.publicKey);

      localStorage.setItem(SELECT_ACCOUNT_KEY, hex);
      setSelected(getSelected(hex));
    }
  }, []);

  return <SelectAccountCtx.Provider value={{ selected, selectAccount }}>{children}</SelectAccountCtx.Provider>;
}
