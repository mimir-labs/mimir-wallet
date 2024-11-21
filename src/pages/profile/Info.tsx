// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountBalance } from '@mimir-wallet/hooks/types';

import { Box, Button, Divider, Grid2 as Grid, Paper, Stack, SvgIcon, Typography } from '@mui/material';
import { BN } from '@polkadot/util';
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';

import IconAdd from '@mimir-wallet/assets/svg/icon-add-fill.svg?react';
import IconFund from '@mimir-wallet/assets/svg/icon-fund-fill.svg?react';
import IconSend from '@mimir-wallet/assets/svg/icon-send-fill.svg?react';
import IconSet from '@mimir-wallet/assets/svg/icon-set.svg?react';
import { FormatBalance } from '@mimir-wallet/components';
import { useApi, useTokenInfo } from '@mimir-wallet/hooks';

function Info({
  address,
  balances,
  toggleFundOpen
}: {
  address?: string;
  balances?: AccountBalance;
  toggleFundOpen: () => void;
}) {
  const [tokenInfo] = useTokenInfo();
  const { tokenSymbol } = useApi();

  const [total, transferrable, locked, reserved] = useMemo(() => {
    const price = tokenInfo?.[tokenSymbol]?.price || '0';

    const priceBN = new BN(Math.ceil(Number(price) * 1e6));

    return [
      balances?.total.mul(priceBN).divn(1e6),
      balances?.transferrable.mul(priceBN).divn(1e6),
      balances?.locked.mul(priceBN).divn(1e6),
      balances?.reserved.mul(priceBN).divn(1e6)
    ];
  }, [balances, tokenInfo, tokenSymbol]);

  const changes = Number(tokenInfo?.[tokenSymbol]?.price_change || '0');

  return (
    <Paper sx={{ flex: 1, width: '100%', height: 'auto', borderRadius: 2, padding: 2 }}>
      <Stack spacing={2}>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: { lg: 'nowrap', xs: 'wrap' } }}>
          <Typography sx={{ flex: '1', whiteSpace: 'nowrap' }} variant='h1'>
            <FormatBalance label='$' value={total} withCurrency={false} />
            <Box
              component='span'
              sx={{
                marginLeft: 0.5,
                verticalAlign: 'middle',
                color: changes > 0 ? 'success.main' : changes < 0 ? 'error.main' : 'grey.500',
                fontSize: '0.875rem'
              }}
            >
              {(changes * 100).toFixed(2)}%
            </Box>
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Button component={Link} endIcon={<SvgIcon component={IconSend} inheritViewBox />} to='/transfer'>
              Transfer
            </Button>
            <Button
              endIcon={<SvgIcon component={IconFund} inheritViewBox />}
              onClick={toggleFundOpen}
              variant='outlined'
            >
              Fund
            </Button>
            <Button
              component={Link}
              endIcon={<SvgIcon component={IconAdd} inheritViewBox />}
              to='/add-proxy'
              variant='outlined'
            >
              Proxy
            </Button>
            {address && (
              <Button
                component={Link}
                sx={{ minWidth: 0 }}
                to={`/account-setting?address=${address}`}
                variant='outlined'
              >
                <SvgIcon component={IconSet} inheritViewBox />
              </Button>
            )}
          </Box>
        </Box>
        <Divider />
        <Box>
          <Grid columns={{ xs: 12 }} container spacing={2}>
            <Grid size={{ xs: 6 }}>
              <Box>
                <Typography color='text.secondary'>Total balance</Typography>
                <Typography variant='h5'>
                  <FormatBalance label='$' value={total} withCurrency={false} />
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Box>
                <Typography color='text.secondary'>Transferable balance</Typography>
                <Typography variant='h5'>
                  <FormatBalance label='$' value={transferrable} withCurrency={false} />
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Box>
                <Typography color='text.secondary'>Locked Balance</Typography>
                <Typography variant='h5'>
                  <FormatBalance label='$' value={locked} withCurrency={false} />
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 6 }}>
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
