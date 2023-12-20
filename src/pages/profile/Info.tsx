// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ReactComponent as IconBack } from '@mimir-wallet/assets/svg/icon-back.svg';
import { ReactComponent as IconSend } from '@mimir-wallet/assets/svg/icon-send-fill.svg';
import { ReactComponent as IconSet } from '@mimir-wallet/assets/svg/icon-set.svg';
import { FormatBalance } from '@mimir-wallet/components';
import { Box, Button, Divider, Paper, Stack, SvgIcon, Typography } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import React from 'react';
import { Link } from 'react-router-dom';

import { AccountBalance } from './types';

function Info({ address, balances, toggleFundOpen }: { address?: string; balances?: AccountBalance; toggleFundOpen: () => void }) {
  return (
    <Paper sx={{ width: '100%', height: 220, borderRadius: 2, padding: 2 }}>
      <Stack spacing={2}>
        <Box sx={{ display: 'flex' }}>
          <Typography sx={{ flex: '1' }} variant='h1'>
            $0
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, '>.MuiButton-root': { borderRadius: 16.5 } }}>
            <Button component={Link} endIcon={<SvgIcon component={IconSend} inheritViewBox sx={{ fontSize: '1rem !important' }} />} to='/transfer'>
              Transfer
            </Button>
            <Button endIcon={<SvgIcon component={IconBack} inheritViewBox sx={{ fontSize: '1rem !important' }} />} onClick={toggleFundOpen} variant='outlined'>
              Fund
            </Button>
            <Button component={Link} sx={{ minWidth: 0 }} to={`/account-setting/${address}`} variant='outlined'>
              <SvgIcon component={IconSet} inheritViewBox sx={{ fontSize: '1rem !important' }} />
            </Button>
          </Box>
        </Box>
        <Divider />
        <Box>
          <Grid columns={{ xs: 12 }} container spacing={2}>
            <Grid xs={6}>
              <Box>
                <Typography color='text.secondary'>Total balance</Typography>
                <Typography variant='h5'>
                  <FormatBalance value={balances?.total} />
                </Typography>
              </Box>
            </Grid>
            <Grid xs={6}>
              <Box>
                <Typography color='text.secondary'>Transferable balance</Typography>
                <Typography variant='h5'>
                  <FormatBalance value={balances?.transferrable} />
                </Typography>
              </Box>
            </Grid>
            <Grid xs={6}>
              <Box>
                <Typography color='text.secondary'>Locked Balance</Typography>
                <Typography variant='h5'>
                  <FormatBalance value={balances?.locked} />
                </Typography>
              </Box>
            </Grid>
            <Grid xs={6}>
              <Box>
                <Typography color='text.secondary'>Redeemable balance</Typography>
                <Typography variant='h5'>
                  <FormatBalance value={balances?.redeemable} />
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Stack>
    </Paper>
  );
}

export default React.memo(Info);
