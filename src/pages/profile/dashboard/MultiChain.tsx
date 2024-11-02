// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Avatar, Box, Button, Paper, Stack, Typography } from '@mui/material';
import React, { useMemo } from 'react';

import { encodeAddress } from '@mimir-wallet/api';
import { allEndpoints } from '@mimir-wallet/config';
import { useApi } from '@mimir-wallet/hooks';

function MultiChain({ address }: { address: string }) {
  const { genesisHash } = useApi();
  const endpoints = useMemo(() => allEndpoints.filter((item) => item.genesisHash !== genesisHash), [genesisHash]);

  return (
    <Paper component={Stack} spacing={2} sx={{ borderRadius: 2, padding: 2 }}>
      <Typography variant='h6'>Multi-Chain</Typography>
      {endpoints.map((item) => {
        const addressSpec = encodeAddress(address, item.ss58Format);

        return (
          <Box
            key={item.genesisHash}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              padding: { sm: 2, xs: 1 },
              background: 'linear-gradient(245deg, #F4F2FF 0%, #FBFDFF 100%)',
              borderRadius: 2
            }}
          >
            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar sx={{ width: 30, height: 30 }} src={item.icon} />
              <Box
                sx={{
                  display: 'flex',
                  alignItems: { sm: 'center', xs: 'start' },
                  flexDirection: { sm: 'row', xs: 'column' },
                  gap: 0.5
                }}
              >
                <span>{item.name}</span>
                <span style={{ fontSize: '0.75rem' }}>
                  {addressSpec.slice(0, 8)}...{addressSpec.slice(-8)}
                </span>
              </Box>
            </Box>
            <Button
              variant='text'
              onClick={() => {
                window.location.href = `${window.location.origin}?address=${addressSpec}&network=${item.key}`;
              }}
            >
              Switch
            </Button>
          </Box>
        );
      })}
    </Paper>
  );
}

export default React.memo(MultiChain);
