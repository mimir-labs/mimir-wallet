// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { HexString } from '@polkadot/util/types';
import type { AccountData, AccountDataExtra } from './types';

import { u8aToHex } from '@polkadot/util';
import { decodeAddress } from '@polkadot/util-crypto';
import { useCallback, useMemo } from 'react';

import { DETECTED_ACCOUNT_KEY } from '@mimir-wallet/constants';

import { createNamedHook } from './createNamedHook';
import { useAccount } from './useAccounts';
import { useLocalStore } from './useStore';

type GroupName = 'mimir' | 'injected' | 'hide';

function groupAccounts(
  accounts: (AccountDataExtra & AccountData)[],
  hideAccountHex: HexString[]
): Record<GroupName, string[]> {
  const ret: Record<GroupName, string[]> = {
    mimir: [],
    injected: [],
    hide: []
  };

  for (let i = 0; i < accounts.length; i++) {
    const account = accounts[i];

    if (account.source) {
      ret.injected.push(account.address);
    } else if (hideAccountHex.includes(u8aToHex(decodeAddress(account.address)))) {
      ret.hide.push(account.address);
    } else {
      ret.mimir.push(account.address);
    }
  }

  return ret;
}

function useGroupAccountsImpl(filter?: (account: AccountData) => boolean): Record<GroupName, string[]> {
  const { accounts, hideAccountHex } = useAccount();

  const allAddress = useMemo(
    () => accounts.filter((a): a is AccountData => (filter ? filter(a) : true)),
    [accounts, filter]
  );

  return useMemo(() => groupAccounts(allAddress, hideAccountHex), [allAddress, hideAccountHex]);
}

export const useGroupAccounts = createNamedHook('useGroupAccounts', useGroupAccountsImpl);

export function useAllAccounts(others?: string[]): string[] {
  const { accounts } = useAccount();

  return useMemo(() => accounts.map((item) => item.address).concat(others || []), [accounts, others]);
}

export function useUnConfirmMultisigs(): [AccountData[], confirm: (addresses: string[]) => void] {
  const [detected, setDetected] = useLocalStore<HexString[]>(DETECTED_ACCOUNT_KEY, []);
  const { accounts } = useAccount();

  return [
    useMemo(
      () =>
        accounts.filter((account) => {
          return !account.source && !detected.includes(u8aToHex(decodeAddress(account.address)));
        }),
      [accounts, detected]
    ),
    useCallback(
      (addresses) => {
        const newValue = Array.from(
          new Set([...detected, ...addresses.map((address) => u8aToHex(decodeAddress(address)))])
        );

        setDetected(newValue);
      },
      [detected, setDetected]
    )
  ];
}
