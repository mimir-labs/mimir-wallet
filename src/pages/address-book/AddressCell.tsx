// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ReactComponent as IconExternal } from '@mimir-wallet/assets/svg/icon-external.svg';
import { ReactComponent as IconQr } from '@mimir-wallet/assets/svg/icon-qr.svg';
import { ReactComponent as IconTransfer } from '@mimir-wallet/assets/svg/icon-transfer.svg';
import { AddressName, CopyButton, IdentityIcon } from '@mimir-wallet/components';
import { Box, IconButton, Paper, Stack, SvgIcon, Typography } from '@mui/material';
import React from 'react';

function AddressCell({ address }: { address: string }) {
  return (
    <Paper sx={{ display: 'flex', alignItems: 'center', gap: 4, borderRadius: '20px', padding: 2.5, boxShadow: '0px 0px 10px rgba(21, 31, 52, 0.06)' }}>
      <Box sx={{ padding: 1, borderRadius: 2, background: 'linear-gradient(245.23deg, #F4F2FF 0%, #FBFDFF 100%)', border: '1px solid', borderColor: 'secondary.main' }}>
        <IdentityIcon size={50} value={address} />
      </Box>
      <Stack spacing={1}>
        <Typography fontWeight={700} variant='h5'>
          <AddressName value={address} />
        </Typography>
        <Typography color='text.secondary' sx={{ wordBreak: 'break-all' }}>
          {address}
        </Typography>
        <Box sx={{ opacity: 0.5 }}>
          <IconButton color='primary' size='small'>
            <SvgIcon component={IconQr} inheritViewBox />
          </IconButton>
          <CopyButton color='primary' value={address} />
          <IconButton color='primary' size='small'>
            <SvgIcon component={IconExternal} inheritViewBox />
          </IconButton>
          <IconButton color='primary' size='small'>
            <SvgIcon component={IconTransfer} inheritViewBox />
          </IconButton>
        </Box>
      </Stack>
    </Paper>
  );
}

export default React.memo(AddressCell);
