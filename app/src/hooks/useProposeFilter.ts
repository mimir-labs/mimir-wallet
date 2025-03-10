// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountData, Transaction } from '@/hooks/types';

import { reduceAccount } from '@/accounts/utils';
import { TransactionType } from '@/hooks/types';
import { addressEq } from '@/utils';
import { useWallet } from '@/wallet/useWallet';
import { useEffect, useState } from 'react';

export function useProposeFilterForRemove(account: AccountData, transaction: Transaction) {
  const [filtered, setFiltered] = useState<string[]>([]);
  const { walletAccounts } = useWallet();

  useEffect(() => {
    const addresses: string[] = [];

    reduceAccount(account, (account, proxyType, delay) => {
      if (!proxyType || delay === 0) {
        if (walletAccounts.some((item) => addressEq(item.address, account.address))) {
          addresses.push(account.address);
        }
      }
    });

    if (
      transaction.type === TransactionType.Propose &&
      walletAccounts.some((item) => addressEq(item.address, transaction.proposer))
    ) {
      setFiltered(Array.from(new Set(addresses.concat(transaction.proposer))));
    } else {
      setFiltered(Array.from(new Set(addresses)));
    }
  }, [account, walletAccounts, transaction.type, transaction.proposer]);

  return filtered;
}

export function useManageProposerFilter(account: AccountData) {
  const [filtered, setFiltered] = useState<string[]>([]);
  const { walletAccounts } = useWallet();

  useEffect(() => {
    const addresses: string[] = [];

    reduceAccount(account, (account, proxyType, delay) => {
      if (!proxyType || delay === 0) {
        if (walletAccounts.some((item) => addressEq(item.address, account.address))) {
          addresses.push(account.address);
        }
      }
    });
    setFiltered(Array.from(new Set(addresses)));
  }, [account, walletAccounts]);

  return filtered;
}
