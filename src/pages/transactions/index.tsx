// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useAddressMeta, useQueryParam, useSelectedAccount } from '@mimir-wallet/hooks';
import { Box, Button, Paper } from '@mui/material';
import keyring from '@polkadot/ui-keyring';
import { useEffect } from 'react';

import HistoryTransactions from './HistoryTransactions';
import PendingTransactions from './PendingTransactions';

function MultisigList({ address, limit, page, setLimit, setPage }: { address: string; page?: number; limit?: number; setPage: (value: string) => void; setLimit: (value: string) => void }) {
  const [type, setType] = useQueryParam<'pending' | 'history'>('status', 'pending');

  const _setPage = (value: number) => setPage(value.toString());
  const _setLimit = (value: number) => setLimit(value.toString());

  return (
    <Box>
      <Paper sx={{ borderRadius: '20px', padding: 1, display: 'inline-flex', marginBottom: 2, gap: 1 }}>
        <Button onClick={() => setType('pending')} sx={{ borderRadius: 1, paddingX: 3 }} variant={type === 'pending' ? 'contained' : 'text'}>
          Pending
        </Button>
        <Button color='primary' onClick={() => setType('history')} sx={{ borderRadius: 1, paddingX: 3 }} variant={type === 'history' ? 'contained' : 'text'}>
          History
        </Button>
      </Paper>
      {type === 'history' ? <HistoryTransactions address={address} limit={limit} page={page} setLimit={_setLimit} setPage={_setPage} /> : <PendingTransactions address={address} />}
    </Box>
  );
}

function AccountList({ address, limit, page, setLimit, setPage }: { address: string; page?: number; limit?: number; setPage: (value: string) => void; setLimit: (value: string) => void }) {
  const _setPage = (value: number) => setPage(value.toString());
  const _setLimit = (value: number) => setLimit(value.toString());

  return (
    <Box>
      <HistoryTransactions address={address} limit={limit} page={page} setLimit={_setLimit} setPage={_setPage} />
    </Box>
  );
}

function Content({ address }: { address: string }) {
  const { meta } = useAddressMeta(address);
  const [page, setPage] = useQueryParam<string>('page', '1');
  const [limit, setLimit] = useQueryParam<string>('limit', '10');

  if (!meta || meta.isMultisig) return <MultisigList address={address} limit={Number(limit) || 10} page={Number(page) || 1} setLimit={setLimit} setPage={setPage} />;

  return <AccountList address={address} limit={Number(limit) || 10} page={Number(page) || 1} setLimit={setLimit} setPage={setPage} />;
}

function PageTransaction() {
  const [address, setAddress] = useQueryParam<string>('address');
  const selected = useSelectedAccount();

  useEffect(() => {
    if (!address) {
      selected && setAddress(selected, { replace: true });
    } else {
      keyring.getAccount(address) && selected && setAddress(selected);
    }
  }, [address, selected, setAddress]);

  if (!address) return null;

  return <Content address={address} />;
}

export default PageTransaction;
