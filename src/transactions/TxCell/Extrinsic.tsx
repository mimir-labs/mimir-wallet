// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { IMethod } from '@polkadot/types/types';
import type { Transaction } from '@mimir-wallet/hooks/types';

import { Alert, AlertTitle, Box, Divider, Grid2 as Grid, Stack } from '@mui/material';
import moment from 'moment';
import React from 'react';

import { AppName, Hex } from '@mimir-wallet/components';
import { useApi, useToggle } from '@mimir-wallet/hooks';
import { Call as CallComp } from '@mimir-wallet/params';

function Item({ content, title }: { title?: React.ReactNode; content?: React.ReactNode }) {
  return (
    <Grid container spacing={1} columns={10} sx={{ fontSize: '0.875rem' }}>
      <Grid sx={{ display: 'flex', alignItems: 'center', fontWeight: 700 }} size={2}>
        {title}
      </Grid>
      <Grid sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }} size={8}>
        {content}
      </Grid>
    </Grid>
  );
}

function Extrinsic({ transaction, call }: { transaction: Transaction; call?: IMethod | null }) {
  const { api } = useApi();
  const [isOpen, toggleOpen] = useToggle();

  return (
    <>
      <Stack flex='1' spacing={1}>
        {call ? (
          <CallComp from={transaction.address} api={api} call={call} jsonFallback />
        ) : (
          <Alert severity='warning'>
            <AlertTitle>Warning</AlertTitle>
            This transaction wasn’t initiated from Mimir. Please confirm the security of this transaction.
          </Alert>
        )}

        <Divider />

        <Item
          title='App'
          content={
            <AppName website={transaction.website} appName={transaction.appName} iconUrl={transaction.iconUrl} />
          }
        />
        <Item title='Hash' content={<Hex showFull value={transaction.callHash} withCopy />} />

        <Box
          sx={{ fontWeight: 700, color: 'primary.main', cursor: 'pointer', textDecoration: 'none' }}
          onClick={toggleOpen}
        >
          {isOpen ? 'Hide' : 'View'} Details
        </Box>

        {isOpen && (
          <>
            {transaction.call && <Item title='Call Data' content={<Hex value={transaction.call} withCopy />} />}
            {transaction.note && <Item title='Call Data' content={transaction.note} />}
            <Item title='Created Block' content={transaction.createdBlock} />
            <Item
              title='Created Extrinsic'
              content={<Hex showFull value={transaction.createdExtrinsicHash} withCopy />}
            />
            <Item title='Created Time' content={moment(transaction.createdAt).format()} />
            <Item title='Updated Time' content={moment(transaction.updatedAt).format()} />
          </>
        )}
      </Stack>
    </>
  );
}

export default React.memo(Extrinsic);
