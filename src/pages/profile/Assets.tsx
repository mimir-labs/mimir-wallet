// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountBalance } from '@mimir-wallet/hooks/types';

import {
  Avatar,
  Box,
  Button,
  IconButton,
  Paper,
  Stack,
  SvgIcon,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { type BN, BN_ZERO } from '@polkadot/util';
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';

import ExpandArrow from '@mimir-wallet/assets/svg/expand-arrow.svg?react';
import IconLock from '@mimir-wallet/assets/svg/icon-lock.svg?react';
import IconSend from '@mimir-wallet/assets/svg/icon-send-fill.svg?react';
import IconReverse from '@mimir-wallet/assets/svg/icon-waiting-fill.svg?react';
import { FormatBalance } from '@mimir-wallet/components';
import { findToken } from '@mimir-wallet/config';
import { useApi, useAssetBalances, useToggle } from '@mimir-wallet/hooks';

function Row({
  assetId,
  decimals,
  defaultOpen,
  icon: propsIcon,
  locked,
  reserved,
  symbol,
  total,
  transferrable
}: {
  defaultOpen?: boolean;
  symbol?: string;
  icon?: string;
  decimals?: number;
  transferrable: BN;
  assetId: string;
  locked: BN;
  reserved: BN;
  total: BN;
}) {
  const { api, tokenSymbol } = useApi();

  const icon = useMemo(() => propsIcon || findToken(api.genesisHash.toHex()).Icon, [api, propsIcon]);
  const [open, toggleOpen] = useToggle(defaultOpen);
  const { breakpoints } = useTheme();
  const downSm = useMediaQuery(breakpoints.down('sm'));
  const format = useMemo(
    (): [decimals: number, unit: string] => [decimals || api.registry.chainDecimals[0], symbol || tokenSymbol],
    [api, decimals, symbol, tokenSymbol]
  );

  // eslint-disable-next-line react/no-unstable-nested-components
  function RowMain() {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
        <Box
          sx={{
            flex: '1',
            display: 'flex',
            alignItems: { sm: 'center', xs: 'flex-start' },
            gap: { sm: 5, xs: 1 },
            flexDirection: { sm: 'row', xs: 'column' }
          }}
        >
          <Typography fontSize='1rem' sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar alt='Token' src={icon} sx={{ width: 32, height: 32 }} />
            {symbol || tokenSymbol}
          </Typography>
          <Typography variant='h6'>
            <FormatBalance format={format} value={total} />
          </Typography>
        </Box>
        <Button
          component={Link}
          endIcon={downSm ? undefined : <SvgIcon component={IconSend} inheritViewBox />}
          sx={{ minWidth: downSm ? 0 : undefined }}
          to={`/transfer?assetId=${assetId}`}
        >
          {downSm ? <SvgIcon component={IconSend} inheritViewBox /> : 'Transfer'}
        </Button>
        <IconButton
          onClick={toggleOpen}
          sx={{ transformOrigin: 'center', transform: `rotateZ(${open ? '0deg' : '180deg'})`, transition: 'all 150ms' }}
        >
          <SvgIcon color='primary' component={ExpandArrow} inheritViewBox />
        </IconButton>
      </Box>
    );
  }

  // eslint-disable-next-line react/no-unstable-nested-components
  function RowSub() {
    return (
      <Paper
        sx={{ width: '100%', marginTop: { sm: 2, xs: 1.5 }, bgcolor: 'secondary.main', borderRadius: 2, padding: 2 }}
      >
        <Box
          sx={{
            display: 'flex',
            flexWrap: { md: 'nowrap', xs: 'wrap' },
            gap: 2,
            alignItems: 'center',
            justifyContent: 'space-between',
            '>div': { display: 'flex', gap: 0.5, alignItems: 'center', color: 'text.secondary' }
          }}
        >
          <Box>
            <SvgIcon component={IconSend} inheritViewBox />
            <span>Transferable</span>
            <b>
              <FormatBalance format={format} value={transferrable} />
            </b>
          </Box>
          <Box>
            <SvgIcon component={IconLock} inheritViewBox />
            <span>Locked balance</span>
            <Typography color='text.primary' fontWeight={700}>
              <FormatBalance format={format} value={locked} />
            </Typography>
          </Box>
          <Box>
            <SvgIcon component={IconReverse} inheritViewBox />
            <span>Reserved balance</span>
            <Typography color='text.primary' fontWeight={700}>
              <FormatBalance format={format} value={reserved} />
            </Typography>
          </Box>
        </Box>
      </Paper>
    );
  }

  return (
    <Box>
      <RowMain />
      {open && <RowSub />}
    </Box>
  );
}

function Assets({ address, nativeBalance }: { address?: string; nativeBalance?: AccountBalance }) {
  const assets = useAssetBalances(address);

  return (
    <Paper component={Stack} spacing={{ xs: 1.5, sm: 2 }} sx={{ width: '100%', borderRadius: 2, padding: 2 }}>
      {nativeBalance && (
        <Row
          assetId='native'
          defaultOpen
          key='native-balance'
          locked={nativeBalance.locked}
          reserved={nativeBalance.reserved}
          total={nativeBalance.total}
          transferrable={nativeBalance.transferrable}
        />
      )}
      {assets.map((item) => (
        <Row
          assetId={item.assetId}
          decimals={item.decimals}
          icon={item.Icon}
          key={`asset-balance-${item.assetId}`}
          locked={BN_ZERO}
          reserved={BN_ZERO}
          symbol={item.symbol}
          total={item.balance}
          transferrable={item.balance}
        />
      ))}
    </Paper>
  );
}

export default React.memo(Assets);
