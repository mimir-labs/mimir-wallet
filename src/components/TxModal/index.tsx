// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SubmittableExtrinsic } from '@polkadot/api/types';

import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Paper, Stack, Typography } from '@mui/material';
import { useState } from 'react';

import { useApi, useTxQueue } from '@mimirdev/hooks';

import AddressCell from '../AddressCell';
import AddressChain from './AddressChain';
import Call from './Call';
import SendTx from './SendTx';

function Contents({ address, beforeSend, extrinsic, onClose }: { beforeSend: () => Promise<void>; address: string; extrinsic: SubmittableExtrinsic<'promise'>; onClose: () => void }) {
  const [accounts, setAccounts] = useState<Record<string, string | undefined>>({});

  return (
    <>
      <DialogContent>
        <Stack spacing={2}>
          <Box>
            <Typography fontWeight={700} mb={1}>
              Sending From
            </Typography>
            <Paper sx={{ bgcolor: 'secondary.main', padding: 1 }}>
              <AddressCell shorten={false} size='small' value={address} withCopy />
            </Paper>
          </Box>
          <Divider />
          <Call method={extrinsic.method} />
          <Divider />
          <AddressChain accounts={accounts} address={address} onChange={setAccounts} />
        </Stack>
      </DialogContent>
      <DialogActions>
        <SendTx accounts={accounts} address={address} beforeSend={beforeSend} extrinsic={extrinsic} />
        <Button fullWidth onClick={onClose} variant='outlined'>
          Cancel
        </Button>
      </DialogActions>
    </>
  );
}

function TxModal() {
  const { isApiReady } = useApi();
  const { queue } = useTxQueue();

  return isApiReady ? (
    queue.map(({ accountId, beforeSend, extrinsic, id, onRemove }) => (
      <Dialog fullWidth key={id} maxWidth='sm' onClose={onRemove} open={true}>
        <DialogTitle>Submit Transaction</DialogTitle>
        {isApiReady && <Contents address={accountId.toString()} beforeSend={beforeSend} extrinsic={extrinsic} onClose={onRemove} />}
      </Dialog>
    ))
  ) : (
    <></>
  );
}

export default TxModal;
