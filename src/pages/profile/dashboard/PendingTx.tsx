// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Paper, Skeleton } from '@mui/material';
import { Stack } from '@mui/system';
import React from 'react';

import { useQueryAccount } from '@mimir-wallet/accounts/useQueryAccount';
import { Empty } from '@mimir-wallet/components';
import { usePendingTransactions } from '@mimir-wallet/hooks/useTransactions';
import { TxCell } from '@mimir-wallet/transactions';

const skeleton = (
  <Stack spacing={2}>
    {Array.from({ length: 5 }).map((_, index) => (
      <Paper component={Stack} spacing={2} key={index} sx={{ padding: { sm: 2, xs: 1.5 }, borderRadius: 2 }}>
        <Skeleton variant='rectangular' height={118} />
        <Skeleton variant='rectangular' height={20} />
        <Skeleton variant='rectangular' height={20} />
        <Skeleton variant='rectangular' height={20} />
      </Paper>
    ))}
  </Stack>
);

function PendingTx({ address }: { address: string }) {
  const [transactions, isFetched, isFetching] = usePendingTransactions(address);
  const [account] = useQueryAccount(address);

  const showSkeleton = isFetching && !isFetched;

  if (showSkeleton || !account) {
    return skeleton;
  }

  if (transactions.length === 0) {
    return <Empty height={200} />;
  }

  return (
    <Stack spacing={2}>
      {transactions.map((transaction) => (
        <TxCell key={transaction.id} withDetails={false} account={account} transaction={transaction} />
      ))}
    </Stack>
  );
}

export default React.memo(PendingTx);
