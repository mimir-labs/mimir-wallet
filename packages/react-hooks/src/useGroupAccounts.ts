// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { KeyringAddress } from '@polkadot/ui-keyring/types';

import { keyring } from '@polkadot/ui-keyring';
import { useMemo } from 'react';

import { getAccountCryptoType } from '@mimirdev/react-components/utils';

import { createNamedHook } from './createNamedHook';
import { useAccounts } from './useAccounts';

type GroupName = 'accounts' | 'injected' | 'multisig' | 'testing';

function groupAccounts(accounts: KeyringAddress[]): Record<GroupName, string[]> {
  const ret: Record<GroupName, string[]> = {
    accounts: [],
    injected: [],
    multisig: [],
    testing: []
  };

  for (let i = 0; i < accounts.length; i++) {
    const account = accounts[i];
    const cryptoType = getAccountCryptoType(account.address);

    if (account?.meta.isTesting) {
      ret.testing.push(account.address);
    } else if (cryptoType === 'injected') {
      ret.injected.push(account.address);
    } else if (cryptoType === 'multisig') {
      ret.multisig.push(account.address);
    } else {
      ret.accounts.push(account.address);
    }
  }

  return ret;
}

function useGroupAccountsImpl(): Record<GroupName, string[]> {
  const { allAccounts } = useAccounts();

  const allAddress = useMemo(
    () =>
      allAccounts
        .map((address): KeyringAddress | undefined => {
          return keyring.getAccount(address);
        })
        .filter((a): a is KeyringAddress => !!a),
    [allAccounts]
  );

  return useMemo(() => groupAccounts(allAddress), [allAddress]);
}

export const useGroupAccounts = createNamedHook('useGroupAccounts', useGroupAccountsImpl);
