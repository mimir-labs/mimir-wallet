// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountId, AccountIndex, Address, Call } from '@polkadot/types/interfaces';

import { Box, Paper, Stack, Typography } from '@mui/material';
import React from 'react';

import { AddressRow, Hex } from '@mimirdev/components';
import Item from '@mimirdev/params/Param/Item';

interface Props {
  call: Call;
  depositor?: string | AccountId | AccountIndex | Address;
}

function Row({ content, label }: { label: string; content: React.ReactNode }) {
  return (
    <Stack direction='row' spacing={2}>
      <Typography width={120}>{label}</Typography>
      <Box flex='1'>{content}</Box>
    </Stack>
  );
}

function CallDetail({ call, depositor }: Props) {
  return (
    <Item
      alignItem='start'
      content={
        <Paper sx={{ padding: 1, bgcolor: 'secondary.main', display: 'flex', flexDirection: 'column', gap: 1, color: 'text.secondary' }}>
          <Row content={<AddressRow shorten size='small' value={depositor} withAddress withCopy withName />} label='Initiator' />
          <Row content={<Hex value={call.hash.toHex()} withCopy />} label='Call Hash' />
          <Row content={<Hex value={call.toHex()} withCopy />} label='Call Data' />
        </Paper>
      }
      name='Detail'
      type='tx'
    />
  );
}

export default React.memo(CallDetail);
