// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Empty } from '@mimir-wallet/components';
import { useAddressMeta, useSelectedAccount } from '@mimir-wallet/hooks';
import { SelectAccountCtx } from '@mimir-wallet/hooks/ctx/SelectedAccount';
import { CalldataStatus } from '@mimir-wallet/hooks/types';
import { TxCell } from '@mimir-wallet/transactions';
import { Box, Button, Paper, Stack } from '@mui/material';
import { useContext, useMemo, useState } from 'react';

function MultisigList() {
  const { transactions } = useContext(SelectAccountCtx);
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
      {list.length > 0 ? (
        <Stack spacing={2}>
          {list.map((transaction, index) => (
            <TxCell defaultOpen={index === 0} key={transaction.uuid} transaction={transaction} />
          ))}
        </Stack>
      ) : (
        <Empty height='calc(100vh - 200px)' label={type === 'pending' ? 'No Pending Transactions' : 'No Transactions'} />
      )}
    </Box>
  );
}

function AccountList() {
  const { transactions } = useContext(SelectAccountCtx);

  if (transactions.length === 0) {
    return <Empty height='calc(100vh - 100px)' label='No Transactions' />;
  }

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

  if (meta.isMultisig) return <MultisigList />;

  return <AccountList />;
}

export default PageTransaction;
