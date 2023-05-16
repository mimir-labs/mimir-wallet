// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountId, AccountIndex, Address } from '@polkadot/types/interfaces';

import { Box, Paper, Stack, Typography } from '@mui/material';
import React from 'react';

import { AddressMini, Hex } from '@mimirdev/react-components';

interface Props {
  callhash: string;
  calldata: string;
  depositor: string | AccountId | AccountIndex | Address;
}

function Item({ content, label }: { label: string; content: React.ReactNode }) {
  return (
    <Stack direction='row' spacing={2}>
      <Typography width={120}>{label}</Typography>
      <Box flex='1'>{content}</Box>
    </Stack>
  );
}

function CallDetail({ calldata, callhash, depositor }: Props) {
  return (
    <Paper sx={{ padding: 1.25, bgcolor: 'secondary.main', display: 'flex', flexDirection: 'column', gap: 1.5, color: 'text.secondary' }}>
      <Item content={<AddressMini value={depositor} withCopy />} label='Initiator' />
      <Item content={<Hex value={callhash} withCopy />} label='Call Hash' />
      <Item content={<Hex value={calldata} withCopy />} label='Call Data' />
    </Paper>
  );
}

export default React.memo(CallDetail);
