// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Pagination, Stack } from '@mui/material';
import React from 'react';

import { Empty } from '@mimir-wallet/components';
import { useHistoryTransactions } from '@mimir-wallet/hooks';
import { TxCell } from '@mimir-wallet/transactions';

function HistoryTransactions({
  address,
  limit: propsLimit = 10,
  page: propsPage = 1,
  setPage
}: {
  address: string;
  page?: number;
  limit?: number;
  setPage: (value: number) => void;
}) {
  const [transactions, page, limit, total] = useHistoryTransactions(address, propsPage, propsLimit);

  if (transactions.length === 0) {
    return <Empty height='80vh' label='No Transactions' />;
  }

  return (
    <Stack spacing={2}>
      {transactions.map((transaction) => (
        <TxCell key={transaction.uuid} transaction={transaction} />
      ))}
      <Pagination
        color='primary'
        count={Math.ceil(total / limit)}
        onChange={(_, page) => {
          setPage(page);
        }}
        page={page}
        shape='rounded'
        variant='outlined'
      />
    </Stack>
  );
}

export default React.memo(HistoryTransactions);
