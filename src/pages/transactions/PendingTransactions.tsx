// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Empty } from '@mimir-wallet/components';
import { usePendingTransactions } from '@mimir-wallet/hooks';
import { TxCell } from '@mimir-wallet/transactions';
import { Stack } from '@mui/material';
import React from 'react';

function PendingTransactions({ address }: { address: string }) {
  const [transactions] = usePendingTransactions(address);

  if (transactions.length === 0) {
    return <Empty height='80vh' label='No Transactions' />;
  }

  return (
    <Stack spacing={2}>
      {transactions.map((transaction, index) => (
        <TxCell defaultOpen={index === 0} key={transaction.uuid} transaction={transaction} />
      ))}
    </Stack>
  );
}

export default React.memo(PendingTransactions);
