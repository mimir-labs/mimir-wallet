// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Button, Paper, Stack } from '@mui/material';
import { useMemo, useState } from 'react';

import { useTransactions } from '@mimirdev/react-hooks';
import { MultisigStatus } from '@mimirdev/react-hooks/types';

import MultisigCell from './MultisigCell';

function PageTransaction() {
  const transactions = useTransactions();

  const [type, setType] = useState<'pending' | 'history'>('pending');

  const list = useMemo(() => {
    return transactions.filter((item) => {
      if (type === 'pending') {
        return item.status === MultisigStatus.Created;
      }

      return true;
    });
  }, [transactions, type]);

  return (
    <Box>
      <Paper sx={{ borderRadius: '20px', padding: 1.25, display: 'inline-flex', marginBottom: 2.5 }}>
        <Button onClick={() => setType('pending')} sx={{ paddingX: 3 }} variant={type === 'pending' ? 'contained' : 'text'}>
          Pending
        </Button>
        <Button color='primary' onClick={() => setType('history')} sx={{ paddingX: 3 }} variant={type === 'history' ? 'contained' : 'text'}>
          History
        </Button>
      </Paper>
      <Stack spacing={2.5}>
        {list.map((transaction, index) => (
          <MultisigCell key={index} transaction={transaction} />
        ))}
      </Stack>
    </Box>
  );
}

export default PageTransaction;
