// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SortDescriptor } from '@react-types/shared';
import type { AccountEnhancedAssetBalance } from '@mimir-wallet/polkadot-core';

import { useAccount } from '@/accounts/useAccount';
import IconAdd from '@/assets/svg/icon-add-fill.svg?react';
import IconArrowClockWise from '@/assets/svg/icon-arrow-clock-wise.svg?react';
import IconSend from '@/assets/svg/icon-send-fill.svg?react';
import { Empty, FormatBalance } from '@/components';
import { toastError, toastSuccess } from '@/components/utils';
import { StakingApp } from '@/config';
import { MigrationTip, useAssetsMigrationStatus, useMigrationNetworks } from '@/features/assethub-migration';
import { useAllChainBalances } from '@/hooks/useChainBalances';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { formatDisplay, formatUnits } from '@/utils';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { useNetworks } from '@mimir-wallet/polkadot-core';
import {
  Avatar,
  Button,
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

function MigrationTips() {
  const { data: migrationNetworks } = useMigrationNetworks();

  function Item({ chain }: { chain: string }) {
    const { isAlertVisible, dismissAlert } = useAssetsMigrationStatus(chain);

    if (!isAlertVisible) {
      return null;
    }

    return <MigrationTip onClose={dismissAlert} type='transfer' chain={chain} />;
  }

  const completedMigrationNetworks = useMemo(() => {
    return migrationNetworks?.filter((network) => network.status === 'completed');
  }, [migrationNetworks]);

  return completedMigrationNetworks?.map((item) => <Item key={item.chain} chain={item.chain} />);
}

function Assets() {
  const { current } = useAccount();
  const allChainBalances = useAllChainBalances(current);
  const { networks } = useNetworks();
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: 'balanceUsd',
    direction: 'descending'
  });
  const upSm = useMediaQuery('sm');
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshAssets = useCallback(async () => {
    if (isRefreshing || !current) return;

    setIsRefreshing(true);

    try {
      // Invalidate all balance-related queries for this address
      await queryClient.invalidateQueries({
        queryKey: ['chain-balances']
      });

      toastSuccess('Assets refreshed successfully');
    } catch (error) {
      console.error(error);
      toastError('Failed to refresh assets');
    } finally {
      setIsRefreshing(false);
    }
  }, [current, isRefreshing, queryClient]);

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
    <div className='flex flex-col gap-5'>
      <div className='flex items-center gap-2'>
        <h4>Assets</h4>
        <Tooltip content='Refresh Asset List'>
          <Button isIconOnly variant='light' size='sm' onClick={refreshAssets} disabled={isRefreshing || !current}>
            <IconArrowClockWise className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </Tooltip>
      </div>

      <MigrationTips />

      <Table
        classNames={{
          wrapper: 'rounded-[10px] sm:rounded-[20px] p-0 sm:p-3',
          th: 'bg-transparent text-xs px-2 text-foreground/50',
          td: 'text-sm px-2',
          loadingWrapper: 'relative h-10 table-cell px-2'
        }}
        sortDescriptor={sortDescriptor}
        onSortChange={setSortDescriptor}
      >
        <TableHeader>
          <TableColumn className='bg-content1 sticky left-0 sm:relative'>Token</TableColumn>
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
          <TableColumn className='bg-content1 sticky right-0 sm:relative' align='end'>
            <span className='hidden sm:inline'>Operation</span>
          </TableColumn>
        </TableHeader>

        <TableBody
          items={list}
          loadingContent={
            <>
              <Skeleton className='h-10 w-full rounded-[10px]' />
              <Spinner size='sm' className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' />
            </>
          }
          emptyContent={done ? <Empty className='text-foreground' height='150px' label='No assets' /> : null}
        >
          {(item) => {
            const isNative = item.isNative;
            const icon = item.logoUri;
            const network = item.network;
            const symbol = item.symbol;
            const total = item.total;
            const transferrable = item.transferrable;
            const locked = item.locked;
            const reserved = item.reserved;
            const price = item.price || 0;
            const decimals = item.decimals;
            const change24h = item.priceChange;
            const format: [number, string] = [decimals, symbol];
            const chainIcon = networks.find((network) => network.key === item.network)?.icon;
            const balanceUsd = formatDisplay(
              formatUnits((total * BigInt((price * 1e8).toFixed(0))) / BigInt(1e8), decimals)
            );

            return (
              <TableRow key={`asset-balance-${isNative ? 'native' : item.key}-${network}`}>
                <TableCell className='bg-content1 sticky left-0 z-[1] sm:relative'>
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

                    <div className='flex flex-col items-start gap-0 sm:flex-row sm:items-center sm:gap-1'>
                      <span>{symbol}</span>

                      {!isNative && !!item.assetId ? (
                        <small className='text-foreground/50 text-[10px] sm:text-xs'>{item.assetId}</small>
                      ) : null}
                    </div>
                  </div>
                </TableCell>
                <TableCell>{price}</TableCell>
                <TableCell
                  data-up={change24h && change24h > 0}
                  data-down={change24h && change24h < 0}
                  className='text-foreground/50 data-[up=true]:text-success data-[down=true]:text-danger'
                >
                  {change24h && change24h > 0 ? '+' : ''}
                  {change24h ? change24h.toFixed(2) : '0'}%
                </TableCell>
                <TableCell>
                  ${balanceUsd[0]}
                  {balanceUsd[1] ? `.${balanceUsd[1]}` : ''}
                  {balanceUsd[2] ? ` ${balanceUsd[2]}` : ''}
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
                <TableCell className='bg-content1 sticky right-0 z-[1] sm:relative'>
                  <div className='inline-flex max-w-[180px] flex-row-reverse items-center gap-0 sm:gap-2.5'>
                    <Button asChild variant={upSm ? 'ghost' : 'light'} size='sm'>
                      <Link
                        to={`/explorer/${encodeURIComponent(`mimir://app/transfer?callbackPath=${encodeURIComponent('/')}`)}?assetId=${item.isNative ? 'native' : item.key}&asset_network=${network}`}
                      >
                        {upSm ? (
                          <>
                            Transfer
                            <IconSend className='h-[14px] w-[14px]' />
                          </>
                        ) : (
                          <IconSend className='h-[14px] w-[14px]' />
                        )}
                      </Link>
                    </Button>

                    {isNative && network === 'polkadot' && (
                      <Button asChild variant={upSm ? 'ghost' : 'light'} size='sm'>
                        <Link to={`/explorer/${encodeURIComponent(`${StakingApp.url}`)}`}>
                          {upSm ? (
                            <>
                              Staking
                              <IconAdd className='h-[14px] w-[14px]' />
                            </>
                          ) : (
                            <IconAdd className='h-[14px] w-[14px]' />
                          )}
                        </Link>
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          }}
        </TableBody>
      </Table>
    </div>
  );
}

export default Assets;
