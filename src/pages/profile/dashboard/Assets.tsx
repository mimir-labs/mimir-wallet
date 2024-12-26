// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { BN } from '@polkadot/util';
import type { AccountBalance } from '@mimir-wallet/hooks/types';

import {
  Avatar,
  Box,
  Button,
  Paper,
  SvgIcon,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';

import IconSend from '@mimir-wallet/assets/svg/icon-send-fill.svg?react';
import { FormatBalance } from '@mimir-wallet/components';
import { findToken } from '@mimir-wallet/config';
import { useApi } from '@mimir-wallet/hooks/useApi';
import { useAssetBalances } from '@mimir-wallet/hooks/useBalances';

function AssetRow({
  assetId,
  decimals,
  icon,
  locked,
  reserved,
  symbol,
  total,
  transferrable
}: {
  symbol?: string;
  icon?: string;
  decimals?: number;
  transferrable?: BN;
  assetId?: string;
  locked?: BN;
  reserved?: BN;
  total?: BN;
}) {
  const { api, tokenSymbol } = useApi();
  const format = useMemo(
    (): [decimals: number, unit: string] => [decimals || api.registry.chainDecimals[0], symbol || tokenSymbol],
    [api.registry.chainDecimals, decimals, symbol, tokenSymbol]
  );

  return (
    <TableRow>
      <TableCell>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Avatar alt='Token' src={icon} sx={{ width: 30, height: 30 }}>
            {(symbol || tokenSymbol).slice(0, 1)}
          </Avatar>
          {symbol || tokenSymbol}
        </Box>
      </TableCell>
      <TableCell>
        <FormatBalance format={format} value={total} />
      </TableCell>
      <TableCell>
        <FormatBalance format={format} value={transferrable} />
      </TableCell>
      <TableCell>
        <FormatBalance format={format} value={reserved} />
      </TableCell>
      <TableCell>
        <FormatBalance format={format} value={locked} />
      </TableCell>
      <TableCell align='right'>
        <Button
          component={Link}
          endIcon={<SvgIcon component={IconSend} inheritViewBox />}
          to={`/explorer/${encodeURIComponent(`mimir://app/transfer?callbackPath=${encodeURIComponent('/')}`)}?assetId=${assetId}`}
          variant='outlined'
          size='small'
        >
          Transfer
        </Button>
      </TableCell>
    </TableRow>
  );
}

function Assets({ address, nativeBalance }: { address: string; nativeBalance?: AccountBalance }) {
  const { genesisHash } = useApi();
  const assets = useAssetBalances(address);

  return (
    <TableContainer
      component={Paper}
      sx={{
        maxWidth: '100%',
        overflowX: 'auto',
        padding: 1,
        borderRadius: 2,
        '.MuiTableCell-root': {
          padding: 1,
          border: 'none'
        }
      }}
    >
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Token</TableCell>
            <TableCell>Total</TableCell>
            <TableCell>Transferable</TableCell>
            <TableCell>Reserved</TableCell>
            <TableCell>Locked</TableCell>
            <TableCell align='right'>Operation</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <AssetRow
            key='native-asset'
            assetId='native'
            locked={nativeBalance?.locked}
            reserved={nativeBalance?.reserved}
            total={nativeBalance?.total}
            icon={findToken(genesisHash).Icon}
            transferrable={nativeBalance?.transferrable}
          />
          {assets.map((item) => (
            <AssetRow
              assetId={item.assetId}
              decimals={item.decimals}
              icon={item.icon}
              key={`asset-balance-${item.assetId}`}
              locked={item.locked}
              reserved={item.reserved}
              symbol={item.symbol}
              total={item.total}
              transferrable={item.transferrable}
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default React.memo(Assets);
