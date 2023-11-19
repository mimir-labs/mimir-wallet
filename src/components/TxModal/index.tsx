// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SubmittableExtrinsic } from '@polkadot/api/types';
import type { Filtered } from '@mimirdev/hooks/ctx/types';

import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Paper, Stack, Typography } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';

import { useApi, useTxQueue } from '@mimirdev/hooks';
import { canSendMultisig, PrepareMultisig, prepareMultisig } from '@mimirdev/utils';

import AddressCell from '../AddressCell';
import LockItem, { LockContainer } from '../LockItem';
import AddressChain from './AddressChain';
import Call from './Call';
import SendTx from './SendTx';

function Contents({
  address,
  beforeSend,
  extrinsic,
  filtered,
  isCancelled,
  onClose
}: {
  beforeSend: () => Promise<void>;
  address: string;
  extrinsic: SubmittableExtrinsic<'promise'>;
  filtered?: Filtered;
  isCancelled: boolean;
  onClose: () => void;
}) {
  const [accounts, setAccounts] = useState<Record<string, string | undefined>>({});
  const { api } = useApi();
  const [prepare, setPrepare] = useState<PrepareMultisig>();
  const canSend = useMemo(() => canSendMultisig(accounts, address), [accounts, address]);

  useEffect(() => {
    if (canSend) {
      prepareMultisig(api, extrinsic, accounts, address, isCancelled).then(setPrepare);
    }
  }, [accounts, address, api, canSend, isCancelled, extrinsic]);

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
          <Call isCancelled={isCancelled} method={extrinsic.method} />
          <Divider />
          <AddressChain accounts={accounts} address={address} filtered={filtered} onChange={setAccounts} />
          {prepare && (!!Object.keys(prepare[2]).length || !!Object.keys(prepare[3]).length) && (
            <LockContainer>
              {Object.entries(prepare[2]).map(([address, value], index) => (
                <LockItem address={address} key={index} value={value} />
              ))}
              {Object.entries(prepare[3]).map(([address, value], index) => (
                <LockItem address={address} isUnLock key={index} value={value} />
              ))}
            </LockContainer>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <SendTx beforeSend={beforeSend} canSend={canSend} onClose={onClose} prepare={prepare} />
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
    queue.map(({ accountId, beforeSend, extrinsic, filtered, id, isCancelled, onRemove }) => (
      <Dialog fullWidth key={id} maxWidth='sm' onClose={onRemove} open={true}>
        <DialogTitle>Submit Transaction</DialogTitle>
        {isApiReady && <Contents address={accountId.toString()} beforeSend={beforeSend} extrinsic={extrinsic} filtered={filtered} isCancelled={isCancelled} onClose={onRemove} />}
      </Dialog>
    ))
  ) : (
    <></>
  );
}

export default TxModal;
