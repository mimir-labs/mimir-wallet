// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountAssetInfo } from '@/hooks/types';
import type { SortDescriptor } from '@react-types/shared';

import IconSend from '@/assets/svg/icon-send-fill.svg?react';
import { Empty, FormatBalance } from '@/components';
import { useAssetBalancesAll } from '@/hooks/useBalances';
import { formatDisplay, formatUnits } from '@/utils';
import React, { useMemo, useState } from 'react';

import { useNetworks } from '@mimir-wallet/polkadot-core';
import {
  Avatar,
  Button,
  Link,
  Skeleton,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Tooltip
} from '@mimir-wallet/ui';

function Assets({ address }: { address: string }) {
  const assets = useAssetBalancesAll(address);
  const { networks } = useNetworks();
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: 'balanceUsd',
    direction: 'descending'
  });

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
        .filter((item) => item.total > 0n)
        .sort((a, b) => {
          if (sortDescriptor.column === 'balanceUsd') {
            const bTotal = (b.total * BigInt((b.price * 1e18).toFixed(0))) / 10n ** BigInt(b.decimals);
            const aTotal = (a.total * BigInt((a.price * 1e18).toFixed(0))) / 10n ** BigInt(a.decimals);

            return sortDescriptor.direction === 'descending' ? (bTotal > aTotal ? 1 : -1) : bTotal > aTotal ? -1 : 1;
          }

          if (sortDescriptor.column === 'price') {
            const bPrice = b.price;
            const aPrice = a.price;

            return sortDescriptor.direction === 'descending' ? (bPrice > aPrice ? 1 : -1) : bPrice > aPrice ? -1 : 1;
          }

          if (sortDescriptor.column === 'change24h') {
            const bChange24h = b.price
              ? b.change24h
              : sortDescriptor.direction === 'descending'
                ? -Number.MAX_SAFE_INTEGER
                : Number.MAX_SAFE_INTEGER;
            const aChange24h = a.price
              ? a.change24h
              : sortDescriptor.direction === 'descending'
                ? -Number.MAX_SAFE_INTEGER
                : Number.MAX_SAFE_INTEGER;

            return sortDescriptor.direction === 'descending'
              ? bChange24h > aChange24h
                ? 1
                : -1
              : bChange24h > aChange24h
                ? -1
                : 1;
          }

          if (sortDescriptor.column === 'total') {
            const bTotal = Number(formatUnits(b.total, b.decimals));
            const aTotal = Number(formatUnits(a.total, a.decimals));

            return sortDescriptor.direction === 'descending' ? (bTotal > aTotal ? 1 : -1) : bTotal > aTotal ? -1 : 1;
          }

          return 0;
        }),
      done
    ];
  }, [assets, sortDescriptor.column, sortDescriptor.direction]);

  return (
    <Table
      classNames={{
        wrapper: 'p-0 sm:p-3',
        th: 'bg-transparent text-tiny px-2',
        td: 'text-small px-2',
        loadingWrapper: 'relative h-10 table-cell px-2'
      }}
      sortDescriptor={sortDescriptor}
      onSortChange={setSortDescriptor}
    >
      <TableHeader>
        <TableColumn className='sticky left-0 sm:relative bg-content1'>Token</TableColumn>
        <TableColumn key='price' allowsSorting>
          Price
        </TableColumn>
        <TableColumn key='change24h' allowsSorting>
          24h Change
        </TableColumn>
        <TableColumn key='balanceUsd' allowsSorting>
          USD Value
        </TableColumn>
        <TableColumn key='total' allowsSorting>
          Amount
        </TableColumn>
        <TableColumn className='sticky right-0 sm:relative bg-content1' align='end'>
          Operation
        </TableColumn>
      </TableHeader>

      <TableBody
        items={list}
        isLoading={!done}
        loadingContent={
          <>
            <Skeleton disableAnimation className='h-10 w-full rounded-md' />
            <Spinner
              size='sm'
              variant='simple'
              className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
            />
          </>
        }
        emptyContent={done ? <Empty className='text-foreground' height='150px' label='No assets' /> : null}
      >
        {(item) => {
          const isNative = item.isNative;
          const assetId = item.assetId;
          const icon = item.icon;
          const network = item.network;
          const symbol = item.symbol;
          const total = item.total;
          const transferrable = item.transferrable;
          const locked = item.locked;
          const reserved = item.reserved;
          const price = item.price;
          const decimals = item.decimals;
          const change24h = item.change24h;
          const format: [number, string] = [decimals, symbol];
          const chainIcon = networks.find((network) => network.key === item.network)?.icon;
          const balanceUsd = formatDisplay(
            formatUnits((total * BigInt((price * 1e8).toFixed(0))) / BigInt(1e8), decimals)
          );

          return (
            <TableRow key={`asset-balance-${item.assetId}-${item.network}`}>
              <TableCell className='z-[1] sticky left-0 sm:relative bg-content1'>
                <div className='flex items-center gap-1'>
                  <div className='relative'>
                    <Avatar
                      alt='Token'
                      fallback={
                        <div className='bg-divider-300 w-[30px] h-[30px] flex items-center justify-center rounded-full text-content1 font-bold text-lg'>
                          {symbol.slice(0, 1)}
                        </div>
                      }
                      src={icon}
                      style={{ width: 30, height: 30 }}
                      className='bg-content1'
                    />
                    <Avatar
                      alt='Chain'
                      src={chainIcon}
                      className='border-black bg-transparent absolute bottom-0 right-0 w-[14px] h-[14px]'
                    />
                  </div>

                  {symbol}

                  {!isNative && <span className='text-xs text-gray-500'>{assetId}</span>}
                </div>
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
                  shadow='lg'
                  placement='bottom'
                  classNames={{ content: 'border-secondary border-1 p-2.5 min-w-[163px]' }}
                  content={
                    <div className='w-full space-y-2.5 [&_div]:flex [&_div]:items-center [&_div]:justify-between [&_div]:gap-x-4'>
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
              <TableCell className='z-[1] sticky sm:relative right-0  bg-content1' align='right'>
                <Button
                  as={Link}
                  endContent={<IconSend />}
                  href={`/explorer/${encodeURIComponent(`mimir://app/transfer?callbackPath=${encodeURIComponent('/')}`)}?assetId=${assetId}&asset_network=${network}`}
                  variant='ghost'
                  size='sm'
                >
                  Transfer
                </Button>
              </TableCell>
            </TableRow>
          );
        }}
      </TableBody>
    </Table>
  );
}

export default React.memo(Assets);

/* <TableRow key='loading-assetes' style={{ display: done ? 'none' : 'table-row' }}>
          <TableCell colSpan={6} align='center'>
            <div className='relative h-10'>
              <Skeleton disableAnimation className='h-10 w-full rounded-md' />
              <Spinner
                size='sm'
                variant='simple'
                className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
              />
            </div>
          </TableCell>
        </TableRow> */
