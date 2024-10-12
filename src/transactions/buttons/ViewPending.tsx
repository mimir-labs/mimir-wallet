// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Transaction } from '@mimir-wallet/hooks/types';

import { Button } from '@mui/material';
import React from 'react';

import { AddressName } from '@mimir-wallet/components';
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

function ViewPending({ transaction }: { transaction: Transaction }) {
  const { setCurrent } = useAccount();

  if (transaction.status !== TransactionStatus.Initialized) {
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
    >
      View Pending Transaction In <AddressName value={subPendingTx.address} />
    </Button>
  );
}

export default React.memo<typeof ViewPending>(ViewPending);
