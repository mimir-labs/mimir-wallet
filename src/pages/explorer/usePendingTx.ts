// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useMemo } from 'react';

import { usePendingTransactions } from '@mimir-wallet/hooks';
import { TransactionStatus } from '@mimir-wallet/hooks/types';

export function usePendingTx(address: string, url: string) {
  const [transactions] = usePendingTransactions(address);

  return useMemo(
    () =>
      transactions.filter((item) => {
        if (item.status > TransactionStatus.Pending || !item.website) {
          return false;
        }

        const urlIn = new URL(url);
        const urlThis = new URL(item.website);

        return urlIn.origin === urlThis.origin;
      }),
    [transactions, url]
  );
}
