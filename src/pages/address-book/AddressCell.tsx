// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ReactComponent as IconEdit } from '@mimir-wallet/assets/svg/icon-edit.svg';
import { ReactComponent as IconLink } from '@mimir-wallet/assets/svg/icon-link.svg';
import { ReactComponent as IconQr } from '@mimir-wallet/assets/svg/icon-qr.svg';
import { ReactComponent as IconTransfer } from '@mimir-wallet/assets/svg/icon-transfer.svg';
import { AddressName, CopyButton, EditAddressDialog, IdentityIcon } from '@mimir-wallet/components';
import { useToggle } from '@mimir-wallet/hooks';
import { Box, IconButton, Paper, Stack, SvgIcon, Typography } from '@mui/material';
import React from 'react';

function AddressCell({ address }: { address: string }) {
  const [open, toggleOpen] = useToggle();

  return (
    <Paper sx={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 4, borderRadius: '20px', padding: 2.5, boxShadow: '0px 0px 10px rgba(21, 31, 52, 0.06)' }}>
      <Box sx={{ padding: 1, borderRadius: 2, background: 'linear-gradient(245deg, #F4F2FF 0%, #FBFDFF 100%)', border: '1px solid', borderColor: 'secondary.main' }}>
        <IdentityIcon size={50} value={address} />
      </Box>
      <IconButton color='primary' onClick={toggleOpen} size='small' sx={{ position: 'absolute', right: 20, top: 20 }}>
        <SvgIcon component={IconEdit} inheritViewBox />
      </IconButton>
      <EditAddressDialog address={address} onClose={toggleOpen} open={open} />
      <Stack spacing={1}>
        <Typography fontWeight={700} variant='h5'>
          <AddressName value={address} />
        </Typography>
        <Typography color='text.secondary' sx={{ wordBreak: 'break-all' }}>
          {address}
        </Typography>
        <Box>
          <IconButton color='primary' size='small'>
            <SvgIcon component={IconQr} inheritViewBox />
          </IconButton>
          <CopyButton color='primary' value={address} />
          <IconButton color='primary' size='small'>
            <SvgIcon component={IconLink} inheritViewBox />
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
