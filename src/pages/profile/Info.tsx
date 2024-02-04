// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ReactComponent as IconSend } from '@mimir-wallet/assets/svg/icon-send-fill.svg';
import { ReactComponent as IconSet } from '@mimir-wallet/assets/svg/icon-set.svg';
import { ReactComponent as IconTransfer } from '@mimir-wallet/assets/svg/icon-transfer.svg';
import { FormatBalance } from '@mimir-wallet/components';
import { useTokenInfo } from '@mimir-wallet/hooks';
import { Box, Button, Divider, Paper, Stack, SvgIcon, Typography } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { BN } from '@polkadot/util';
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';

import { AccountBalance } from './types';

function Info({ balances, toggleFundOpen }: { address?: string; balances?: AccountBalance; toggleFundOpen: () => void }) {
  const [tokenInfo] = useTokenInfo();

  const [total, transferrable, locked, reserved] = useMemo(() => {
    const price = tokenInfo?.[Object.keys(tokenInfo)[0]]?.price || '0';

    const priceBN = new BN(Math.ceil(Number(price) * 1e6));

    return [balances?.total.mul(priceBN).divn(1e6), balances?.transferrable.mul(priceBN).divn(1e6), balances?.locked.mul(priceBN).divn(1e6), balances?.reserved.mul(priceBN).divn(1e6)];
  }, [balances, tokenInfo]);

  const changes = Number(tokenInfo?.[Object.keys(tokenInfo)[0]]?.price_change || '0');

  return (
    <Paper sx={{ width: '100%', height: 220, borderRadius: 2, padding: 2 }}>
      <Stack spacing={2}>
        <Box sx={{ display: 'flex' }}>
          <Typography sx={{ flex: '1' }} variant='h1'>
            <FormatBalance label='$' value={transferrable} withCurrency={false} />
            <Box component='span' sx={{ marginLeft: 0.5, verticalAlign: 'middle', color: changes > 0 ? 'success.main' : changes < 0 ? 'error.main' : 'grey.500' }}>
              {(changes * 100).toFixed(2)}%
            </Box>
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button component={Link} endIcon={<SvgIcon component={IconSend} inheritViewBox />} to='/transfer'>
              Transfer
            </Button>
            <Button endIcon={<SvgIcon component={IconTransfer} inheritViewBox />} onClick={toggleFundOpen} variant='outlined'>
              Fund
            </Button>
            <Button component={Link} sx={{ minWidth: 0 }} to={'/account-setting'} variant='outlined'>
              <SvgIcon component={IconSet} inheritViewBox />
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
                  <FormatBalance label='$' value={total} withCurrency={false} />
                </Typography>
              </Box>
            </Grid>
            <Grid xs={6}>
              <Box>
                <Typography color='text.secondary'>Transferable balance</Typography>
                <Typography variant='h5'>
                  <FormatBalance label='$' value={transferrable} withCurrency={false} />
                </Typography>
              </Box>
            </Grid>
            <Grid xs={6}>
              <Box>
                <Typography color='text.secondary'>Locked Balance</Typography>
                <Typography variant='h5'>
                  <FormatBalance label='$' value={locked} withCurrency={false} />
                </Typography>
              </Box>
            </Grid>
            <Grid xs={6}>
              <Box>
                <Typography color='text.secondary'>Reserved balance</Typography>
                <Typography variant='h5'>
                  <FormatBalance label='$' value={reserved} withCurrency={false} />
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
