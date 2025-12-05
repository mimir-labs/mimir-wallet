// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountEnhancedAssetBalance } from '@mimir-wallet/polkadot-core';
import type { SortDescriptor } from '@mimir-wallet/ui';

import { useChains } from '@mimir-wallet/polkadot-core';
import {
  Avatar,
  Button,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Tooltip
} from '@mimir-wallet/ui';
import { Link } from '@tanstack/react-router';
import React, { useMemo, useState } from 'react';

import IconAdd from '@/assets/svg/icon-add-fill.svg?react';
import IconSend from '@/assets/svg/icon-send-fill.svg?react';
import { Empty, FormatBalance } from '@/components';
import { StakingApp } from '@/config';
import { useAllChainBalances } from '@/hooks/useChainBalances';
import { formatDisplay, formatUnits } from '@/utils';

function Assets({ address }: { address: string }) {
  const allChainBalances = useAllChainBalances(address);
  const { chains: networks } = useChains();
  const [sortDescriptor] = useState<SortDescriptor>({
    column: 'balanceUsd',
    direction: 'descending'
  });

  const [list, done] = useMemo(() => {
    const _list: (AccountEnhancedAssetBalance & { network: string })[] = [];
    let done = true;

    for (const chainBalance of allChainBalances) {
      if (chainBalance.isFetched) {
        if (chainBalance.data) {
          for (const asset of chainBalance.data) {
            if (asset.total > 0n) {
              _list.push({
                ...asset,
                network: chainBalance.chain
              });
            }
          }
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
              ? b.priceChange || 0
              : sortDescriptor.direction === 'descending'
                ? -Number.MAX_SAFE_INTEGER
                : Number.MAX_SAFE_INTEGER;
            const aChange24h = a.price
              ? a.priceChange || 0
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
  }, [allChainBalances, sortDescriptor.column, sortDescriptor.direction]);

  return (
    <Table
      stickyHeader
      containerClassName='border-secondary bg-background shadow-md rounded-[20px] border'
      scrollClassName='h-auto sm:h-[260px] px-2 sm:px-3'
    >
      <TableHeader>
        <TableRow>
          <TableColumn className='w-[33%] pt-5 pb-2'>Token</TableColumn>
          <TableColumn className='w-[33%] pt-5 pb-2'>Amount</TableColumn>
          <TableColumn className='w-[33%] pt-5 pb-2'>USD Value</TableColumn>
        </TableRow>
      </TableHeader>

      <TableBody>
        {done && list.length === 0 ? (
          <TableRow>
            <TableCell colSpan={3}>
              <Empty className='text-foreground' height='150px' label='No assets' />
            </TableCell>
          </TableRow>
        ) : (
          list.map((item) => {
            const isNative = item.isNative;
            const icon = item.logoUri;
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
            const network = item.network;

            return (
              <TableRow
                key={`asset-balance-${isNative ? 'native' : item.key}-${network}`}
                className='[&:hover>td]:bg-secondary [&:hover_.operation]:flex [&>td]:first:rounded-l-[10px] [&>td]:last:rounded-r-[10px]'
              >
                <TableCell>
                  <div className='flex items-center gap-1'>
                    <div className='relative'>
                      <Avatar
                        alt='Token'
                        fallback={symbol.slice(0, 1)}
                        src={icon}
                        style={{ width: 30, height: 30 }}
                        className='bg-background'
                      />
                      <Avatar
                        alt='Chain'
                        src={chainIcon}
                        className='absolute right-0 bottom-0 h-[14px] w-[14px] border-black bg-transparent'
                      />
                    </div>

                    <div className='flex flex-col items-start gap-0'>
                      <span>{symbol}</span>

                      {!isNative && !!item.assetId ? (
                        <small className='text-foreground/50 text-[10px] sm:text-xs'>{item.assetId}</small>
                      ) : null}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Tooltip
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
                  <div className='flex items-center justify-between gap-[5px]'>
                    <span className='text-nowrap'>
                      ${balanceUsd[0]}
                      {balanceUsd[1] ? `.${balanceUsd[1]}` : ''}
                      {balanceUsd[2] ? ` ${balanceUsd[2]}` : ''}
                    </span>

                    <div className='operation hidden flex-row-reverse items-center gap-0 sm:gap-[5px]'>
                      <Tooltip content='Transfer'>
                        <Button asChild isIconOnly variant='light' size='sm'>
                          <Link
                            to='/explorer/$url'
                            params={{ url: `mimir://app/transfer?callbackPath=${encodeURIComponent('/')}` }}
                            search={{ assetId: item.isNative ? 'native' : item.key, asset_network: network }}
                          >
                            <IconSend className='h-[14px] w-[14px]' />
                          </Link>
                        </Button>
                      </Tooltip>

                      {isNative && network === 'polkadot' && (
                        <Tooltip content='Stake'>
                          <Button asChild isIconOnly variant='light' size='sm'>
                            <Link to='/explorer/$url' params={{ url: `${StakingApp.url}` }}>
                              <IconAdd className='h-[14px] w-[14px]' />
                            </Link>
                          </Button>
                        </Tooltip>
                      )}
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            );
          })
        )}
        {!done && (
          <TableRow>
            <TableCell colSpan={3}>
              <Skeleton className='h-10 w-full rounded-[10px]' />
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}

export default React.memo(Assets);
