// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountData } from '@/hooks/types';
import type { HexString } from '@polkadot/util/types';

import { DETECTED_ACCOUNT_KEY } from '@/constants';
import { u8aToHex } from '@polkadot/util';
import { decodeAddress } from '@polkadot/util-crypto';
import { useCallback, useMemo } from 'react';

import { useLocalStore } from '@mimir-wallet/service';

import { useAccount } from './useAccount';
import { groupAccounts, type GroupName } from './utils';

export function useGroupAccounts(filter?: (account: AccountData) => boolean): Record<GroupName, string[]> {
  const { accounts, hideAccountHex, metas } = useAccount();

  const allAddress = useMemo(
    () => accounts.filter((a): a is AccountData => (filter ? filter(a) : true)),
    [accounts, filter]
  );

  return useMemo(() => groupAccounts(allAddress, hideAccountHex, metas), [allAddress, hideAccountHex, metas]);
}

export function useAllAccounts(others?: string[]): string[] {
  const { accounts } = useAccount();

  return useMemo(() => accounts.map((item) => item.address).concat(others || []), [accounts, others]);
}

export function useUnConfirmMultisigs(): [confirm: (addresses: string[]) => void] {
  const [detected, setDetected] = useLocalStore<HexString[]>(DETECTED_ACCOUNT_KEY, []);

  return [
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
