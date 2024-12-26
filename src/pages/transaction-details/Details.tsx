// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { IMethod } from '@polkadot/types/types';
import type { Transaction } from '@mimir-wallet/hooks/types';

import { Alert, AlertTitle, Box, Button, Divider, Paper, Stack, Typography } from '@mui/material';
import moment from 'moment';
import React, { useMemo } from 'react';
import { useToggle } from 'react-use';

import { findTargetCall } from '@mimir-wallet/api';
import { AddressCell, Bytes, Hash } from '@mimir-wallet/components';
import { useApi } from '@mimir-wallet/hooks/useApi';
import { FunctionArgs } from '@mimir-wallet/params';

function Item({ content, title }: { title?: React.ReactNode; content?: React.ReactNode }) {
  return (
    <Stack spacing={0.5}>
      <Typography fontWeight={700}>{title}</Typography>

      <Box sx={{ padding: 1, bgcolor: 'secondary.main', borderRadius: 1 }}>{content}</Box>
    </Stack>
  );
}

function Target({ call, address }: { address: string; call?: IMethod | null }) {
  const { api } = useApi();
  const [from, targetCall] = useMemo(() => findTargetCall(api, address, call), [address, api, call]);

  if (!call) {
    return null;
  }

  return (
    <>
      <Item title='From' content={<AddressCell iconSize={40} withCopy value={from} />} />

      {targetCall ? (
        <FunctionArgs displayType='vertical' from={from} registry={api.registry} call={targetCall} jsonFallback />
      ) : null}

      {!call && (
        <Alert severity='warning'>
          <AlertTitle>Warning</AlertTitle>
          This transaction wasn’t initiated from Mimir. Please confirm the security of this transaction.
        </Alert>
      )}
    </>
  );
}

function Details({ transaction }: { transaction: Transaction }) {
  const { api } = useApi();
  const [isOpen, toggleOpen] = useToggle(false);

  const call = useMemo(() => {
    if (!transaction.call) return null;

    try {
      return api.createType('Call', transaction.call);
    } catch {
      return null;
    }
  }, [api, transaction.call]);

  return (
    <Paper component={Stack} spacing={1} sx={{ padding: 1.5, borderRadius: 2 }}>
      <Typography variant='h6' color='primary'>
        Detail
      </Typography>
      <Divider />

      <Item title='Created Time' content={moment(transaction.createdAt).format()} />
      {transaction.note && <Item title='Note' content={transaction.note} />}
      <Item
        title='Created Extrinsic'
        content={<Hash value={transaction.createdExtrinsicHash} withCopy withExplorer />}
      />
      {transaction.executedExtrinsicHash && (
        <Item
          title='Executed Extrinsic'
          content={<Hash value={transaction.executedExtrinsicHash} withCopy withExplorer />}
        />
      )}

      <Target address={transaction.address} call={call} />

      {!isOpen && (
        <Button color='secondary' sx={{ borderRadius: 1 }} onClick={toggleOpen}>
          Detail
        </Button>
      )}

      {isOpen && (
        <>
          <Item title='Call Hash' content={<Hash value={transaction.callHash} withCopy />} />
          {transaction.call && <Item title='Call Data' content={<Bytes value={transaction.call} />} />}
          <Item title='Created Block' content={transaction.createdBlock} />
          {transaction.executedBlock && <Item title='Executed Block' content={transaction.executedBlock} />}
          {transaction.cancelBlock && <Item title='Cancel Block' content={transaction.cancelBlock} />}
          {transaction.cancelExtrinsicHash && (
            <Item
              title='Cancel Extrinsic'
              content={<Hash value={transaction.cancelExtrinsicHash} withCopy withExplorer />}
            />
          )}
        </>
      )}
    </Paper>
  );
}

export default React.memo(Details);
