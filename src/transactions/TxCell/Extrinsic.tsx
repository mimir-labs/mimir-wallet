// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { IMethod } from '@polkadot/types/types';
import type { Transaction } from '@mimir-wallet/hooks/types';

import { Box, Divider, Grid2 as Grid, Stack } from '@mui/material';
import moment from 'moment';
import React from 'react';

import { AppName, Bytes, Hash } from '@mimir-wallet/components';
import { useToggle } from '@mimir-wallet/hooks';

import Target from './Target';

export function Item({ content, title }: { title?: React.ReactNode; content?: React.ReactNode }) {
  return (
    <Grid container spacing={1} columns={10} sx={{ fontSize: '0.875rem' }}>
      <Grid sx={{ display: 'flex', alignItems: 'center', fontWeight: 700, fontSize: '0.75rem' }} size={2}>
        {title}
      </Grid>
      <Grid sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary', fontSize: '0.75rem' }} size={8}>
        {content}
      </Grid>
    </Grid>
  );
}

function Extrinsic({
  defaultOpen,
  transaction,
  call
}: {
  defaultOpen?: boolean;
  transaction: Transaction;
  call?: IMethod | null;
}) {
  const [isOpen, toggleOpen] = useToggle(defaultOpen);

  return (
    <>
      <Stack flex='1' spacing={1}>
        <Target address={transaction.address} call={call} />

        <Divider />

        <Item
          title='App'
          content={
            <AppName website={transaction.website} appName={transaction.appName} iconUrl={transaction.iconUrl} />
          }
        />
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

        <Box
          sx={{ fontWeight: 700, color: 'primary.main', cursor: 'pointer', textDecoration: 'none' }}
          onClick={toggleOpen}
        >
          {isOpen ? 'Hide' : 'View'} Details
        </Box>

        {isOpen && (
          <>
            <Item title='Call Hash' content={<Hash value={transaction.callHash} withCopy />} />
            {transaction.call && <Item title='Call Data' content={<Bytes value={transaction.call} />} />}
            {transaction.note && <Item title='Note' content={transaction.note} />}
            <Item title='Created Block' content={transaction.createdBlock} />
            <Item title='Created Time' content={moment(transaction.createdAt).format()} />
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
      </Stack>
    </>
  );
}

export default React.memo(Extrinsic);
