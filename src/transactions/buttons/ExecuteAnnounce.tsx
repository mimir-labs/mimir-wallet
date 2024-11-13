// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountData, Transaction } from '@mimir-wallet/hooks/types';

import { LoadingButton } from '@mui/lab';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from '@mui/material';
import React, { useState } from 'react';
import { useToggle } from 'react-use';

import { Input, toastError } from '@mimir-wallet/components';
import { useApi, useTxQueue, useWallet } from '@mimir-wallet/hooks';
import { TransactionType } from '@mimir-wallet/hooks/types';
import { addressEq } from '@mimir-wallet/utils';

import { useAnnouncementStatus } from '../hooks/useAnnouncementStatus';

function ExecuteAnnounce({ account, transaction }: { account: AccountData; transaction: Transaction }) {
  const { api } = useApi();
  const { addQueue } = useTxQueue();
  const { walletAccounts } = useWallet();
  const [status] = useAnnouncementStatus(transaction, account);
  const [loading, setLoading] = useState(false);
  const [isOpen, toggleOpen] = useToggle(false);
  const [calldata, setCalldata] = useState('');

  if (walletAccounts.length === 0) {
    return null;
  }

  if (transaction.type !== TransactionType.Announce) {
    return null;
  }

  const delegate = transaction.delegate;

  if (!delegate) {
    return null;
  }

  if (status !== 'executable') {
    return null;
  }

  const handleExecute = async () => {
    setLoading(true);

    try {
      let call: string;

      if (transaction.call) {
        call = transaction.call;
      } else {
        if (api.createType('Call', calldata).hash.toHex() !== transaction.callHash) {
          throw new Error('Invalid calldata');
        }

        call = calldata;
      }

      const proxies = await api.query.proxy.proxies(transaction.address);

      const proxyDefine = proxies[0].find((item) => addressEq(item.delegate, delegate));

      if (!proxyDefine) {
        toastError(`can not find delegate(${delegate})`);
      } else {
        addQueue({
          call: api.tx.proxy.proxyAnnounced(delegate, transaction.address, proxyDefine.proxyType, call),
          website: 'mimir://internal/execute-announcement'
        });
      }
    } catch (error) {
      toastError(error);
    }

    toggleOpen(false);
    setLoading(false);
  };

  return (
    <>
      <LoadingButton
        fullWidth
        variant='contained'
        onClick={transaction.call ? handleExecute : toggleOpen}
        loading={loading}
      >
        Execute
      </LoadingButton>

      <Dialog fullWidth maxWidth='sm' onClose={toggleOpen} open={isOpen}>
        <DialogTitle>Call Data</DialogTitle>
        <DialogContent>
          <Stack spacing={1.5}>
            <Typography>Fill Call Data to execute this transaction.</Typography>
            <Input value={calldata} onChange={setCalldata} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button fullWidth variant='contained' color='primary' onClick={handleExecute}>
            Execute
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default React.memo<typeof ExecuteAnnounce>(ExecuteAnnounce);
