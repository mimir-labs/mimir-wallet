// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { usePendingTransactions } from '@mimir-wallet/hooks';
import { CalldataStatus } from '@mimir-wallet/hooks/types';
import { useMemo } from 'react';

export function usePendingTx(address: string, url: string) {
  const [transactions] = usePendingTransactions(address);

  return useMemo(
    () =>
      transactions.filter((item) => {
        if (item.status > CalldataStatus.Pending) {
          return false;
        }

        if (!item.initTransaction.website) {
          return false;
        }

        const urlIn = new URL(url);
        const urlThis = new URL(item.initTransaction.website);

        return urlIn.origin === urlThis.origin;
      }),
    [transactions, url]
  );
}
