// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Button, Paper, Stack } from '@mui/material';
import { useMemo, useState } from 'react';

import { useSelectedAccount, useTransactions } from '@mimirdev/hooks';
import { CalldataStatus } from '@mimirdev/hooks/types';

import TxCell from './TxCell';

function PageTransaction() {
  const current = useSelectedAccount();
  const [transactions] = useTransactions(current);

  const [type, setType] = useState<'pending' | 'history'>('pending');

  const list = useMemo(() => {
    return transactions
      .sort((l, r) => (r.initTransaction.height || 0) - (l.initTransaction.height || 0))
      .filter((item) => {
        if (item.top) {
          return type === 'pending' ? item.top.status < CalldataStatus.Success && item.status < CalldataStatus.Success : item.top.status > CalldataStatus.Pending;
        } else {
          return type === 'pending' ? item.status < CalldataStatus.Success : item.status > CalldataStatus.Pending;
        }
      });
  }, [transactions, type]);

  return (
    <Box>
      <Paper sx={{ borderRadius: '20px', padding: 1, display: 'inline-flex', marginBottom: 2 }}>
        <Button onClick={() => setType('pending')} sx={{ paddingX: 3 }} variant={type === 'pending' ? 'contained' : 'text'}>
          Pending
        </Button>
        <Button color='primary' onClick={() => setType('history')} sx={{ paddingX: 3 }} variant={type === 'history' ? 'contained' : 'text'}>
          History
        </Button>
      </Paper>
      <Stack spacing={2}>
        {list.map((transaction) => (
          <TxCell key={transaction.uuid} transaction={transaction} />
        ))}
      </Stack>
    </Box>
  );
}

export default PageTransaction;
