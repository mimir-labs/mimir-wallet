// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Button, Paper } from '@mui/material';

import { useQueryAccount, useQueryParam, useSelectedAccount } from '@mimir-wallet/hooks';

import HistoryTransactions from './HistoryTransactions';
import PendingTransactions from './PendingTransactions';

function MultisigList({ address }: { address: string }) {
  const [account] = useQueryAccount(address);

  const [type, setType] = useQueryParam<'pending' | 'history'>('status', 'pending');

  if (!account) return null;

  return (
    <Box>
      <Paper sx={{ borderRadius: '20px', padding: 1, display: 'inline-flex', marginBottom: 2, gap: 1 }}>
        <Button
          onClick={() => setType('pending')}
          sx={{ borderRadius: 1, paddingX: 3 }}
          variant={type === 'pending' ? 'contained' : 'text'}
        >
          Pending
        </Button>
        <Button
          color='primary'
          onClick={() => setType('history')}
          sx={{ borderRadius: 1, paddingX: 3 }}
          variant={type === 'history' ? 'contained' : 'text'}
        >
          History
        </Button>
      </Paper>

      {type === 'history' ? <HistoryTransactions account={account} /> : <PendingTransactions account={account} />}
    </Box>
  );
}

function Content({ address }: { address: string }) {
  return <MultisigList address={address} />;
}

function PageTransaction() {
  const selected = useSelectedAccount();

  if (!selected) return null;

  return <Content address={selected} />;
}

export default PageTransaction;
