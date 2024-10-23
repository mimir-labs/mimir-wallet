// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { FilterPath, Transaction } from '@mimir-wallet/hooks/types';

import { Button } from '@mui/material';
import React from 'react';

import { useAccount } from '@mimir-wallet/hooks';
import { TransactionStatus } from '@mimir-wallet/hooks/types';

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

function ViewPending({ transaction, filterPaths }: { transaction: Transaction; filterPaths: Array<FilterPath[]> }) {
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
      onClick={() => {
        setCurrent(subPendingTx.address);
      }}
      variant='outlined'
    >
      View Pending Transaction
    </Button>
  );
}

export default React.memo<typeof ViewPending>(ViewPending);
