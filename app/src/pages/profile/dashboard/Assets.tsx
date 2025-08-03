// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountAssetInfo } from '@/hooks/types';
import type { SortDescriptor } from '@react-types/shared';

import { Empty, FormatBalance } from '@/components';
import { useAssetBalancesAll, useNativeBalancesAll } from '@/hooks/useBalances';
import { formatDisplay, formatUnits } from '@/utils';
import React, { useMemo, useState } from 'react';

import { useNetworks } from '@mimir-wallet/polkadot-core';
import {
  Avatar,
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
  const nativeBalances = useNativeBalancesAll(address);
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

    for (const item of nativeBalances) {
      if (item.isFetched) {
        if (item.data && item.data.total > 0n) {
          _list.push(item.data);
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
            const bTotal = Number(formatUnits(b.total, b.decimals)) * (b.price || 0);
            const aTotal = Number(formatUnits(a.total, a.decimals)) * (a.price || 0);

            return sortDescriptor.direction === 'descending' ? bTotal - aTotal : aTotal - bTotal;
          }

          if (sortDescriptor.column === 'price') {
            const bPrice = b.price || 0;
            const aPrice = a.price || 0;

            return sortDescriptor.direction === 'descending' ? (bPrice > aPrice ? 1 : -1) : bPrice > aPrice ? -1 : 1;
          }

          if (sortDescriptor.column === 'change24h') {
            const bChange24h = b.price
              ? b.change24h || 0
              : sortDescriptor.direction === 'descending'
                ? -Number.MAX_SAFE_INTEGER
                : Number.MAX_SAFE_INTEGER;
            const aChange24h = a.price
              ? a.change24h || 0
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
  }, [assets, nativeBalances, sortDescriptor.column, sortDescriptor.direction]);

  return (
    <Table
      isHeaderSticky
      shadow='md'
      classNames={{
        base: 'py-0 group',
        wrapper: 'rounded-large p-3 h-auto sm:h-[260px] py-0 scroll-hover-show',
        thead: '[&>tr]:first:shadow-none bg-content1/70 backdrop-saturate-150 backdrop-blur-sm',
        th: 'bg-transparent text-tiny h-auto pt-5 pb-2 px-2 text-foreground/50 first:rounded-none last:rounded-none',
        td: 'text-small px-2',
        loadingWrapper: 'relative h-10 table-cell px-2'
      }}
      sortDescriptor={sortDescriptor}
      onSortChange={setSortDescriptor}
    >
      <TableHeader>
        <TableColumn>Token</TableColumn>
        <TableColumn key='total' allowsSorting>
          Amount
        </TableColumn>
        <TableColumn key='balanceUsd' allowsSorting>
          USD Value
        </TableColumn>
      </TableHeader>

      <TableBody
        items={list}
        isLoading={!done}
        loadingContent={
          <>
            <Skeleton disableAnimation className='rounded-medium h-10 w-full' />
            <Spinner size='sm' className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' />
          </>
        }
        emptyContent={done ? <Empty className='text-foreground' height='150px' label='No assets' /> : null}
      >
        {(item) => {
          const isNative = item.isNative;
          const assetId = item.assetId;
          const icon = item.icon;
          const symbol = item.symbol;
          const total = item.total;
          const transferrable = item.transferrable;
          const locked = item.locked;
          const reserved = item.reserved;
          const price = item.price || 0;
          const decimals = item.decimals;
          const format: [number, string] = [decimals, symbol];
          const chainIcon = networks.find((network) => network.key === item.network)?.icon;
          const balanceUsd = formatDisplay(
            formatUnits((total * BigInt((price * 1e8).toFixed(0))) / BigInt(1e8), decimals)
          );

          return (
            <TableRow key={`asset-balance-${item.assetId}-${item.network}`}>
              <TableCell>
                <div className='flex items-center gap-1'>
                  <div className='relative'>
                    <Avatar
                      alt='Token'
                      fallback={
                        <div className='bg-divider-300 text-content1 flex h-[30px] w-[30px] items-center justify-center rounded-full text-lg font-bold'>
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
                      className='absolute right-0 bottom-0 h-[14px] w-[14px] border-black bg-transparent'
                    />
                  </div>

                  <div className='flex flex-col items-start gap-0'>
                    <span>{symbol}</span>

                    {!isNative && <small className='text-foreground/50 text-[10px]'>{assetId}</small>}
                  </div>
                </div>
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
              <TableCell>
                ${balanceUsd[0]}
                {balanceUsd[1] ? `.${balanceUsd[1]}` : ''}
                {balanceUsd[2] ? ` ${balanceUsd[2]}` : ''}
              </TableCell>
            </TableRow>
          );
        }}
      </TableBody>
    </Table>
  );
}

export default React.memo(Assets);
