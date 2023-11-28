// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SubmittableExtrinsic } from '@polkadot/api/types';
import type { Call } from '@polkadot/types/interfaces';
import type { IMethod } from '@polkadot/types/types';
import type { Filtered } from '@mimirdev/hooks/ctx/types';

import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Paper, Stack, Typography } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { useApi, useTransactions, useTxQueue } from '@mimirdev/hooks';
import { CalldataStatus } from '@mimirdev/hooks/types';
import { canSendMultisig, PrepareMultisig, prepareMultisig } from '@mimirdev/utils';

import AddressCell from '../AddressCell';
import LockItem, { LockContainer } from '../LockItem';
import AddressChain from './AddressChain';
import CallComp from './Call';
import SendTx from './SendTx';

function Contents({
  address,
  beforeSend,
  extrinsic,
  filtered,
  isApprove,
  isCancelled,
  onClose,
  targetCall,
  targetSender
}: {
  beforeSend: () => Promise<void>;
  address: string;
  targetCall: Call | IMethod;
  targetSender: string;
  extrinsic: SubmittableExtrinsic<'promise'>;
  filtered?: Filtered;
  isApprove: boolean;
  isCancelled: boolean;
  onClose: () => void;
}) {
  const [accounts, setAccounts] = useState<Record<string, string | undefined>>({});
  const { api } = useApi();
  const [prepare, setPrepare] = useState<PrepareMultisig>();
  const canSend = useMemo(() => canSendMultisig(accounts, address), [accounts, address]);
  const [txs] = useTransactions(!isApprove && !isCancelled ? address : undefined);
  const pendingTxs = useMemo(() => txs.filter((item) => item.status < CalldataStatus.Success && item.call.hash.toHex() === extrinsic.method.hash.toHex()), [extrinsic.method.hash, txs]);

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
              <AddressCell shorten={false} size='small' value={targetSender} withCopy />
            </Paper>
          </Box>
          <Divider />
          <CallComp isCancelled={isCancelled} method={targetCall || extrinsic.method} />
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
      <DialogActions sx={{ flexDirection: 'column', gap: 1, alignItems: 'start' }}>
        {pendingTxs.length > 0 && (
          <Alert severity='error' sx={{ width: '100%' }}>
            This transaction has already been initiated as{' '}
            <Link
              to={{
                pathname: '/transactions',
                hash: pendingTxs[0].uuid
              }}
            >
              No.{pendingTxs[0].uuid.slice(0, 8).toUpperCase()}
            </Link>
            .
          </Alert>
        )}
        <Box sx={{ marginLeft: '0px !important', width: '100%', display: 'flex', gap: 1 }}>
          <SendTx beforeSend={beforeSend} canSend={canSend} disabled={pendingTxs.length > 0} onClose={onClose} prepare={prepare} />
          <Button fullWidth onClick={onClose} variant='outlined'>
            Cancel
          </Button>
        </Box>
      </DialogActions>
    </>
  );
}

function TxModal() {
  const { isApiReady } = useApi();
  const { queue } = useTxQueue();

  return isApiReady ? (
    queue.map(({ accountId, beforeSend, extrinsic, filtered, id, isApprove, isCancelled, onRemove, targetCall, targetSender }) => (
      <Dialog fullWidth key={id} maxWidth='sm' onClose={onRemove} open={true}>
        <DialogTitle>Submit Transaction</DialogTitle>
        {isApiReady && (
          <Contents
            address={accountId.toString()}
            beforeSend={beforeSend}
            extrinsic={extrinsic}
            filtered={filtered}
            isApprove={isApprove}
            isCancelled={isCancelled}
            onClose={onRemove}
            targetCall={targetCall}
            targetSender={targetSender.toString()}
          />
        )}
      </Dialog>
    ))
  ) : (
    <></>
  );
}

export default TxModal;
