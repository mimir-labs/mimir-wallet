// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Button, Paper } from '@mui/material';
import { Link } from 'react-router-dom';

import AccountSetting from './account-setting';
import NetworkSetting from './network';

function Setting({ type }: { type: 'general' | 'account' }) {
  return (
    <Box
      maxWidth='sm'
      sx={{
        width: 500,
        maxWidth: '100%',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        alignItems: 'stretch'
      }}
    >
      <Paper sx={{ borderRadius: '20px', padding: 1, display: 'inline-flex', alignSelf: 'start', gap: 1 }}>
        <Button
          component={Link}
          to='/account-setting'
          sx={{ borderRadius: 1, paddingX: 3 }}
          variant={type === 'account' ? 'contained' : 'text'}
        >
          Wallet Setting
        </Button>
        <Button
          component={Link}
          to='/setting'
          color='primary'
          sx={{ borderRadius: 1, paddingX: 3 }}
          variant={type === 'general' ? 'contained' : 'text'}
        >
          General Setting
        </Button>
      </Paper>

      {type === 'account' ? (
        <AccountSetting />
      ) : (
        <>
          <NetworkSetting />
        </>
      )}
    </Box>
  );
}

export default Setting;
