// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { FilterPath, Transaction } from '@/hooks/types';

import { useAccount } from '@/accounts/useAccount';
import { TransactionStatus } from '@/hooks/types';
import React from 'react';

import { Button } from '@mimir-wallet/ui';

function findSubPendingTx(transaction: Transaction): Transaction | null {
  for (const subTx of transaction.children) {
    if (subTx.status === TransactionStatus.Pending) {
      return subTx;
    }

    if (subTx.status === TransactionStatus.Initialized) {
      return findSubPendingTx(subTx);
    }
  }

  return null;
}

function ViewPending({ transaction, filterPaths }: { transaction: Transaction; filterPaths: FilterPath[][] }) {
  const { setCurrent } = useAccount();

  if (transaction.status !== TransactionStatus.Initialized) {
    return null;
  }

  if (filterPaths.length) {
    return null;
  }

  const subPendingTx = findSubPendingTx(transaction);

  if (!subPendingTx) {
    return null;
  }

  return (
    <Button
      fullWidth
      color='primary'
      variant='ghost'
      onPress={() => {
        setCurrent(subPendingTx.address);
      }}
    >
      View Pending Transaction
    </Button>
  );
}

export default React.memo<typeof ViewPending>(ViewPending);
