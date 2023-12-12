// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Button, Paper, Stack } from '@mui/material';
import { useMemo, useState } from 'react';

import { useAddressMeta, useSelectedAccount, useTransactions } from '@mimirdev/hooks';
import { CalldataStatus } from '@mimirdev/hooks/types';

import TxCell from './TxCell';

function MultisigList({ address }: { address: string }) {
  const [transactions] = useTransactions(address);
  const [type, setType] = useState<'pending' | 'history'>('pending');

  const list = useMemo(() => {
    return transactions
      .sort((l, r) => (r.initTransaction.height || 0) - (l.initTransaction.height || 0))
      .filter((item) => {
        return type === 'pending' ? item.status < CalldataStatus.Success : item.status > CalldataStatus.Pending;
      });
  }, [transactions, type]);

  return (
    <Box>
      <Paper sx={{ borderRadius: '20px', padding: 1, display: 'inline-flex', marginBottom: 2, gap: 1 }}>
        <Button onClick={() => setType('pending')} sx={{ paddingX: 3 }} variant={type === 'pending' ? 'contained' : 'text'}>
          Pending
        </Button>
        <Button color='primary' onClick={() => setType('history')} sx={{ paddingX: 3 }} variant={type === 'history' ? 'contained' : 'text'}>
          History
        </Button>
      </Paper>
      <Stack spacing={2}>
        {list.map((transaction, index) => (
          <TxCell defaultOpen={index === 0} key={transaction.uuid} transaction={transaction} />
        ))}
      </Stack>
    </Box>
  );
}

function AccountList({ address }: { address: string }) {
  const [transactions] = useTransactions(address);

  return (
    <Box>
      <Paper sx={{ borderRadius: '20px', padding: 1, display: 'inline-flex', marginBottom: 2, gap: 1 }}>
        <Button color='primary' sx={{ paddingX: 3 }} variant='contained'>
          History
        </Button>
      </Paper>
      <Stack spacing={2}>
        {transactions.map((transaction, index) => (
          <TxCell defaultOpen={index === 0} key={transaction.uuid} transaction={transaction} />
        ))}
      </Stack>
    </Box>
  );
}

function PageTransaction() {
  const current = useSelectedAccount();
  const { meta } = useAddressMeta(current);

  if (!current) return null;

  if (meta.isMultisig) return <MultisigList address={current} />;

  return <AccountList address={current} />;
}

export default PageTransaction;
