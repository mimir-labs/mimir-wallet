// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountId, AccountIndex, Address, Call } from '@polkadot/types/interfaces';

import { Box, Paper, Stack, Typography } from '@mui/material';
import React from 'react';

import { AddressRow, Hex } from '@mimirdev/components';

interface Props {
  call: Call;
  depositor?: string | AccountId | AccountIndex | Address;
}

function Item({ content, label }: { label: string; content: React.ReactNode }) {
  return (
    <Stack direction='row' spacing={2}>
      <Typography width={120}>{label}</Typography>
      <Box flex='1'>{content}</Box>
    </Stack>
  );
}

function CallDetail({ call, depositor }: Props) {
  return (
    <Paper sx={{ padding: 1, bgcolor: 'secondary.main', display: 'flex', flexDirection: 'column', gap: 1, color: 'text.secondary' }}>
      <Typography color='text.primary' fontWeight={700}>
        Detail
      </Typography>
      <Item content={<AddressRow shorten size='small' value={depositor} withAddress withCopy withName />} label='Initiator' />
      <Item content={<Hex value={call.hash.toHex()} withCopy />} label='Call Hash' />
      <Item content={<Hex value={call.toHex()} withCopy />} label='Call Data' />
    </Paper>
  );
}

export default React.memo(CallDetail);
