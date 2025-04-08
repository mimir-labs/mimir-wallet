// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Empty } from '@/components';
import { usePendingTransactions } from '@/hooks/useTransactions';
import { TxCell } from '@/transactions';
import { Paper, Skeleton } from '@mui/material';
import { Stack } from '@mui/system';
import React from 'react';

import { useApi } from '@mimir-wallet/polkadot-core';

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
  const { network } = useApi();
  const [transactions, isFetched, isFetching] = usePendingTransactions(network, address);

  const showSkeleton = isFetching && !isFetched;

  if (showSkeleton) {
    return skeleton;
  }

  if (transactions.length === 0) {
    return <Empty height={200} />;
  }

  return (
    <Stack spacing={2}>
      {transactions.map((transaction) => (
        <TxCell key={transaction.id} withDetails={false} address={address} transaction={transaction} />
      ))}
    </Stack>
  );
}

export default React.memo(PendingTx);
