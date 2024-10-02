// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, IconButton, SvgIcon, Typography } from '@mui/material';
import React from 'react';

import IconArrow from '@mimir-wallet/assets/svg/icon-arrow.svg?react';
import IconDelete from '@mimir-wallet/assets/svg/icon-delete.svg?react';
import { AddressCell } from '@mimir-wallet/components';

function ProxyInfo({
  delay,
  proxyType,
  proxied,
  delegate,
  onDelete
}: {
  delay: number;
  proxyType: string;
  proxied?: string;
  delegate: string;
  onDelete?: () => void;
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        padding: 1,
        gap: 0.5,
        bgcolor: 'secondary.main',
        borderRadius: 1
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary', fontSize: '0.75rem' }}>
        <Typography flex={1} fontSize='inherit'>
          Review Window:{' '}
          <Box component='b' color='text.primary' fontWeight={700} marginRight={1}>
            {delay}
          </Box>
          Authorize:{' '}
          <Box component='b' color='text.primary' fontWeight={700}>
            {proxyType}
          </Box>
        </Typography>
        {onDelete && (
          <IconButton color='error' size='small' sx={{ fontSize: 'inherit' }} onClick={onDelete}>
            <SvgIcon component={IconDelete} inheritViewBox />
          </IconButton>
        )}
      </Box>

      <Box
        sx={{
          display: 'flex',
          gap: 1,
          alignItems: 'center',
          '&>.AddressCell': { bgcolor: 'background.paper', paddingY: 0.5, paddingX: 1, borderRadius: 1 }
        }}
      >
        <AddressCell withCopy value={proxied} />
        <SvgIcon component={IconArrow} fontSize='small' inheritViewBox color='primary' />
        <AddressCell withCopy value={delegate} />
      </Box>
    </Box>
  );
}

export default React.memo(ProxyInfo);
