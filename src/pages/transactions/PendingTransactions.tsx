// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountData } from '@mimir-wallet/hooks/types';

import { Stack } from '@mui/material';
import React from 'react';

import { Empty } from '@mimir-wallet/components';
import { usePendingTransactions } from '@mimir-wallet/hooks';
import { TxCell } from '@mimir-wallet/transactions';

import { skeleton } from './skeleton';

function PendingTransactions({ account }: { account: AccountData }) {
  const [transactions, isFetched, isFetching] = usePendingTransactions(account.address);

  const showSkeleton = isFetching && !isFetched;

  if (showSkeleton || !account) {
    return skeleton;
  }

  if (transactions.length === 0) {
    return <Empty height='80dvh' />;
  }

  return (
    <Stack spacing={2}>
      {transactions.map((transaction, index) => (
        <TxCell defaultOpen={index === 0} key={transaction.id} account={account} transaction={transaction} />
      ))}
    </Stack>
  );
}

export default React.memo(PendingTransactions);