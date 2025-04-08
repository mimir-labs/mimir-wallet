// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountAssetInfo } from '@/hooks/types';

import IconSend from '@/assets/svg/icon-send-fill.svg?react';
import { FormatBalance } from '@/components';
import { useAssetBalancesAll } from '@/hooks/useBalances';
import { formatDisplay, formatUnits } from '@/utils';
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
import { BN, BN_ZERO } from '@polkadot/util';
import React, { useMemo } from 'react';

import { useApi } from '@mimir-wallet/polkadot-core';
import { Link, Skeleton, Tooltip } from '@mimir-wallet/ui';

function AssetRow({
  network,
  assetId,
  decimals,
  icon,
  locked,
  reserved,
  symbol,
  total,
  transferrable,
  isNative,
  price,
  change24h
}: {
  network: string;
  symbol: string;
  icon?: string;
  decimals: number;
  transferrable?: BN;
  assetId: string;
  locked: BN;
  reserved: BN;
  total: BN;
  isNative: boolean;
  price: number;
  change24h: number;
}) {
  const { allApis } = useApi();
  const format = useMemo((): [decimals: number, unit: string] => [decimals, symbol], [decimals, symbol]);
  const chainIcon = allApis[network]?.chain?.icon;
  const balanceUsd = useMemo(
    () => formatDisplay(formatUnits(total.mul(new BN((price * 1e8).toFixed(0))).div(new BN(1e8)), decimals)),
    [total, price, decimals]
  );

  return (
    <TableRow>
      <TableCell>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <div className='relative'>
            <Avatar alt='Token' src={icon} sx={{ position: 'relative', width: 30, height: 30 }} />
            <Avatar
              alt='Chain'
              src={chainIcon}
              sx={{
                border: '1px solid',
                borderColor: 'black',
                bgcolor: 'white',
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: 14,
                height: 14
              }}
            />
          </div>

          {symbol}

          {!isNative && <span className='text-xs text-gray-500'>{assetId}</span>}
        </Box>
      </TableCell>
      <TableCell>{price}</TableCell>
      <TableCell
        data-up={change24h > 0}
        data-down={change24h < 0}
        className='text-foreground/50 data-[up=true]:text-success data-[down=true]:text-danger'
      >
        {change24h > 0 ? '+' : ''}
        {change24h ? (change24h * 100).toFixed(2) : '0'}%
      </TableCell>
      <TableCell>
        ${balanceUsd[0]}
        {balanceUsd[1] ? `.${balanceUsd[1]}` : ''}
        {balanceUsd[2] ? ` ${balanceUsd[2]}` : ''}
      </TableCell>
      <TableCell>
        <Tooltip
          shadow='md'
          placement='bottom-start'
          content={
            <div className='space-y-4 [&_div]:flex [&_div]:items-center [&_div]:justify-between [&_div]:gap-x-4'>
              <div>
                <span>Transferable</span>
                <FormatBalance format={format} value={transferrable} />
              </div>
              <div>
                <span>Reserved</span>
                <FormatBalance format={format} value={reserved} />
              </div>
              <div>
                <span>Locked</span>
                <FormatBalance format={format} value={locked} />
              </div>
            </div>
          }
        >
          <span>
            <FormatBalance format={format} value={total} />
          </span>
        </Tooltip>
      </TableCell>
      <TableCell align='right'>
        <Button
          component={Link}
          endIcon={<SvgIcon component={IconSend} inheritViewBox />}
          href={`/explorer/${encodeURIComponent(`mimir://app/transfer?callbackPath=${encodeURIComponent('/')}`)}?assetId=${assetId}&asset_network=${network}`}
          variant='outlined'
          size='small'
        >
          Transfer
        </Button>
      </TableCell>
    </TableRow>
  );
}

function Assets({ address }: { address: string }) {
  const assets = useAssetBalancesAll(address);

  const [list, done] = useMemo(() => {
    const _list: AccountAssetInfo[] = [];
    let done = true;

    for (const item of assets) {
      if (item.isFetched) {
        if (item.data) {
          _list.push(...item.data);
        }
      } else {
        done = false;
      }
    }

    return [
      _list
        .filter((item) => item.total.gt(BN_ZERO))
        .sort((a, b) =>
          b.total
            .mul(new BN((b.price * 1e18).toFixed(0)))
            .div(new BN((10 ** b.decimals).toString()))
            .cmp(a.total.mul(new BN((a.price * 1e18).toFixed(0))).div(new BN((10 ** a.decimals).toString())))
        )
        .filter((item) => item.total.gt(BN_ZERO)),
      done
    ];
  }, [assets]);

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
            <TableCell>Price</TableCell>
            <TableCell>24h Change</TableCell>
            <TableCell>USD Value</TableCell>
            <TableCell>Amount</TableCell>
            <TableCell align='right'>Operation</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {list.map((item) => (
            <AssetRow
              key={`asset-balance-${item.assetId}-${item.network}`}
              network={item.network}
              assetId={item.assetId}
              decimals={item.decimals}
              icon={item.icon}
              isNative={item.isNative}
              locked={item.locked}
              reserved={item.reserved}
              symbol={item.symbol}
              total={item.total}
              transferrable={item.transferrable}
              price={item.price}
              change24h={item.change24h}
            />
          ))}
          {!done ? (
            <TableRow>
              <TableCell colSpan={6} align='center'>
                <Skeleton className='h-8 w-full rounded-md' />
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default React.memo(Assets);
