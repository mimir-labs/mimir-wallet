// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { SelectAccountCtx } from '@mimir-wallet/hooks/ctx/SelectedAccount';
import { useContext, useMemo } from 'react';

export function usePendingTx(url: string) {
  const { transactions } = useContext(SelectAccountCtx);

  return useMemo(
    () =>
      transactions.filter((item) => {
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
