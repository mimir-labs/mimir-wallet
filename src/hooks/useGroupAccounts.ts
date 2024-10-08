// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { KeyringAddress } from '@polkadot/ui-keyring/types';
import type { HexString } from '@polkadot/util/types';

import { keyring } from '@polkadot/ui-keyring';
import { u8aToHex } from '@polkadot/util';
import { decodeAddress } from '@polkadot/util-crypto';
import { useMemo, useState } from 'react';
import store from 'store';

import { DETECTED_ACCOUNT_KEY } from '@mimir-wallet/constants';
import { AddressMeta, getAccountCryptoType, getAddressMeta } from '@mimir-wallet/utils';

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
      const meta = getAddressMeta(account.address);

      if (!meta.isHidden) {
        ret.multisig.push(account.address);
      }
    } else {
      ret.accounts.push(account.address);
    }
  }

  return ret;
}

function useGroupAccountsImpl(filter?: (address: string, meta: AddressMeta) => boolean): Record<GroupName, string[]> {
  const { allAccounts } = useAccounts();

  const allAddress = useMemo(
    () =>
      allAccounts
        .map((address): KeyringAddress | undefined => {
          return keyring.getAccount(address);
        })
        .filter((a): a is KeyringAddress => !!a && (filter ? filter(a.address, a.meta) : true)),
    [allAccounts, filter]
  );

  return useMemo(() => groupAccounts(allAddress), [allAddress]);
}

export const useGroupAccounts = createNamedHook('useGroupAccounts', useGroupAccountsImpl);

export function useAllAccounts(others?: string[]): string[] {
  const { accounts, injected, multisig, testing } = useGroupAccounts();

  return useMemo(
    () =>
      accounts
        .concat(injected)
        .concat(multisig)
        .concat(testing)
        .concat(others || []),
    [accounts, injected, multisig, others, testing]
  );
}

export function useUnConfirmMultisigs(): [string[], confirm: (addresses: string[]) => void] {
  const [detected, setDetected] = useState<HexString[]>(store.get(DETECTED_ACCOUNT_KEY) || []);
  const { allAccounts } = useAccounts();

  return useMemo(
    () => [
      allAccounts.filter((address) => {
        const meta = getAddressMeta(address);

        return meta.isMultisig && !meta.isHidden && !detected.includes(u8aToHex(decodeAddress(address)));
      }),
      (addresses) => {
        const newValue = Array.from(
          new Set([...detected, ...addresses.map((address) => u8aToHex(decodeAddress(address)))])
        );

        setDetected(newValue);
        store.set(DETECTED_ACCOUNT_KEY, newValue);
      }
    ],
    [allAccounts, detected]
  );
}
