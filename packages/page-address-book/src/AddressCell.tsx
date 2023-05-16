// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, IconButton, Paper, Stack, Typography } from '@mui/material';
import React from 'react';

import { IconExternal, IconQr, IconTransfer } from '@mimirdev/app-config/icons';
import { AccountName, CopyButton, IdentityIcon } from '@mimirdev/react-components';

function AddressCell({ address }: { address: string }) {
  return (
    <Paper sx={{ display: 'flex', alignItems: 'center', gap: 4, borderRadius: '20px', padding: 2.5, boxShadow: '0px 0px 10px rgba(21, 31, 52, 0.06)' }}>
      <Box sx={{ padding: 1.25, borderRadius: '10px', background: 'linear-gradient(245.23deg, #F4F2FF 0%, #FBFDFF 100%)', border: '1px solid', borderColor: 'secondary.main' }}>
        <IdentityIcon size={50} value={address} />
      </Box>
      <Stack spacing={1}>
        <Typography fontWeight={700} variant='h5'>
          <AccountName value={address} />
        </Typography>
        <Typography sx={{ wordBreak: 'break-all' }}>{address}</Typography>
        <Box>
          <IconButton color='primary' size='small'>
            <IconQr />
          </IconButton>
          <CopyButton color='primary' value={address} />
          <IconButton color='primary' size='small'>
            <IconExternal />
          </IconButton>
          <IconButton color='primary' size='small'>
            <IconTransfer />
          </IconButton>
        </Box>
      </Stack>
    </Paper>
  );
}

export default React.memo(AddressCell);
