// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountEnhancedAssetBalance } from '@mimir-wallet/polkadot-core';
import type { SortDescriptor } from '@mimir-wallet/ui';

import { useChains } from '@mimir-wallet/polkadot-core';
import {
  Avatar,
  Button,
  Skeleton,
  SortableTableColumn,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Tooltip,
} from '@mimir-wallet/ui';
import { useQueryClient } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { useCallback, useMemo, useState } from 'react';

import { useAccount } from '@/accounts/useAccount';
import IconAdd from '@/assets/svg/icon-add-fill.svg?react';
import IconArrowClockWise from '@/assets/svg/icon-arrow-clock-wise.svg?react';
import IconSend from '@/assets/svg/icon-send-fill.svg?react';
import { Empty, FormatBalance } from '@/components';
import { toastError, toastSuccess } from '@/components/utils';
import { StakingApp } from '@/config';
import {
  MigrationTip,
  useAssetsMigrationStatus,
  useMigrationNetworks,
} from '@/features/assethub-migration';
import { useAllChainBalances } from '@/hooks/useChainBalances';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { formatDisplay, formatUnits } from '@/utils';

function MigrationTips() {
  const { data: migrationNetworks } = useMigrationNetworks();

  function Item({ chain }: { chain: string }) {
    const { isAlertVisible, dismissAlert } = useAssetsMigrationStatus(chain);

    if (!isAlertVisible) {
      return null;
    }

    return (
      <MigrationTip onClose={dismissAlert} type="transfer" chain={chain} />
    );
  }

  const completedMigrationNetworks = useMemo(() => {
    return migrationNetworks?.filter(
      (network) => network.status === 'completed',
    );
  }, [migrationNetworks]);

  return completedMigrationNetworks?.map((item) => (
    <Item key={item.chain} chain={item.chain} />
  ));
}

function Assets() {
  const { current } = useAccount();
  const allChainBalances = useAllChainBalances(current);
  const { chains: networks } = useChains();
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: 'balanceUsd',
    direction: 'descending',
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
        queryKey: ['chain-balances'],
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
                network: chainBalance.chain,
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
            const bTotal =
              Number(formatUnits(b.total, b.decimals)) * (b.price || 0);
            const aTotal =
              Number(formatUnits(a.total, a.decimals)) * (a.price || 0);

            return sortDescriptor.direction === 'descending'
              ? bTotal - aTotal
              : aTotal - bTotal;
          }

          if (sortDescriptor.column === 'price') {
            const bPrice = b.price || 0;
            const aPrice = a.price || 0;

            return sortDescriptor.direction === 'descending'
              ? bPrice > aPrice
                ? 1
                : -1
              : bPrice > aPrice
                ? -1
                : 1;
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

            return sortDescriptor.direction === 'descending'
              ? bTotal > aTotal
                ? 1
                : -1
              : bTotal > aTotal
                ? -1
                : 1;
          }

          return 0;
        }),
      done,
    ];
  }, [allChainBalances, sortDescriptor.column, sortDescriptor.direction]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-2">
        <h4>Assets</h4>
        <Tooltip content="Refresh Asset List">
          <Button
            isIconOnly
            variant="light"
            size="sm"
            onClick={refreshAssets}
            disabled={isRefreshing || !current}
          >
            <IconArrowClockWise
              className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
            />
          </Button>
        </Tooltip>
      </div>

      <MigrationTips />

      <Table containerClassName="overflow-auto rounded-[10px] sm:rounded-[20px] sm:p-3">
        <TableHeader>
          <TableRow>
            <TableColumn className="bg-background sticky left-0 py-2.5 sm:relative">
              Token
            </TableColumn>
            <SortableTableColumn
              className="py-2.5"
              columnKey="price"
              sortDescriptor={sortDescriptor}
              onSortChange={setSortDescriptor}
            >
              Price
            </SortableTableColumn>
            <SortableTableColumn
              className="py-2.5"
              columnKey="change24h"
              sortDescriptor={sortDescriptor}
              onSortChange={setSortDescriptor}
            >
              24h Change
            </SortableTableColumn>
            <SortableTableColumn
              className="py-2.5"
              columnKey="balanceUsd"
              sortDescriptor={sortDescriptor}
              onSortChange={setSortDescriptor}
            >
              USD Value
            </SortableTableColumn>
            <SortableTableColumn
              className="py-2.5"
              columnKey="total"
              sortDescriptor={sortDescriptor}
              onSortChange={setSortDescriptor}
            >
              Amount
            </SortableTableColumn>
            <TableColumn className="bg-background sticky right-0 py-2.5 text-right sm:relative">
              <span className="hidden sm:inline">Operation</span>
            </TableColumn>
          </TableRow>
        </TableHeader>

        <TableBody>
          {done && list.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6}>
                <Empty
                  className="text-foreground"
                  height="150px"
                  label="No assets"
                />
              </TableCell>
            </TableRow>
          ) : (
            list.map((item) => {
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
              const chainIcon = networks.find(
                (network) => network.key === item.network,
              )?.icon;
              const balanceUsd = formatDisplay(
                formatUnits(
                  (total * BigInt((price * 1e8).toFixed(0))) / BigInt(1e8),
                  decimals,
                ),
              );

              return (
                <TableRow
                  key={`asset-balance-${isNative ? 'native' : item.key}-${network}`}
                >
                  <TableCell className="bg-background sticky left-0 z-1 sm:relative">
                    <div className="flex items-center gap-1">
                      <div className="relative">
                        <Avatar
                          alt="Token"
                          fallback={symbol.slice(0, 1)}
                          src={icon}
                          style={{ width: 30, height: 30 }}
                          className="bg-background"
                        />
                        <Avatar
                          alt="Chain"
                          src={chainIcon}
                          className="absolute right-0 bottom-0 h-3.5 w-3.5 border-black bg-transparent"
                        />
                      </div>

                      <div className="flex flex-col items-start gap-0 sm:flex-row sm:items-center sm:gap-1">
                        <span>{symbol}</span>

                        {!isNative && !!item.assetId ? (
                          <small className="text-foreground/50 text-[10px] sm:text-xs">
                            {item.assetId}
                          </small>
                        ) : null}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{price}</TableCell>
                  <TableCell
                    data-up={change24h && change24h > 0}
                    data-down={change24h && change24h < 0}
                    className="text-foreground/50 data-[down=true]:text-danger data-[up=true]:text-success"
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
                      classNames={{
                        content:
                          'border-secondary border-1 p-2.5 min-w-[163px]',
                      }}
                      content={
                        <div className="w-full space-y-2.5 [&_div]:flex [&_div]:items-center [&_div]:justify-between [&_div]:gap-x-4">
                          <div>
                            <span>Transferable</span>
                            <FormatBalance
                              format={format}
                              value={transferrable}
                            />
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
                  <TableCell className="bg-background sticky right-0 z-1 text-right sm:relative">
                    <div className="inline-flex max-w-[180px] flex-row-reverse items-center gap-0 sm:gap-2.5">
                      <Button
                        asChild
                        variant={upSm ? 'ghost' : 'light'}
                        size="sm"
                      >
                        <Link
                          to="/explorer/$url"
                          params={{
                            url: `mimir://app/transfer?callbackPath=${encodeURIComponent('/')}`,
                          }}
                          search={{
                            assetId: item.isNative ? 'native' : item.key,
                            asset_network: network,
                          }}
                        >
                          {upSm ? (
                            <>
                              Transfer
                              <IconSend className="h-3.5 w-3.5" />
                            </>
                          ) : (
                            <IconSend className="h-3.5 w-3.5" />
                          )}
                        </Link>
                      </Button>

                      {isNative && network === 'polkadot' && (
                        <Button
                          asChild
                          variant={upSm ? 'ghost' : 'light'}
                          size="sm"
                        >
                          <Link
                            to="/explorer/$url"
                            params={{ url: StakingApp.url }}
                          >
                            {upSm ? (
                              <>
                                Staking
                                <IconAdd className="h-3.5 w-3.5" />
                              </>
                            ) : (
                              <IconAdd className="h-3.5 w-3.5" />
                            )}
                          </Link>
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
          {!done && (
            <TableRow>
              <TableCell colSpan={6}>
                <Skeleton className="h-10 w-full rounded-[10px]" />
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

export default Assets;
