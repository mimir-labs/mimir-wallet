// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import IconArrowClockWise from '@/assets/svg/icon-arrow-clock-wise.svg?react';
import { toastError, toastSuccess } from '@/components/utils';
import { useBalanceTotalUsd } from '@/hooks/useChainBalances';
import { useInputNetwork } from '@/hooks/useInputNetwork';
import { useQueryClient } from '@tanstack/react-query';
import React, { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';

import { SubApiRoot } from '@mimir-wallet/polkadot-core';
import { Button, Tooltip } from '@mimir-wallet/ui';

import AccountStructure from './AccountStructure';
import Assets from './Assets';
import FavoriteDapps from './FavoriteDapps';
import Hero from './Hero';
import PendingTransactions from './PendingTransactions';

function Title({ endContent, children }: { endContent?: React.ReactNode; children?: React.ReactNode }) {
  return (
    <div className='mb-[5px] flex items-center justify-between'>
      <h6 className='leading-[24px]'>{children}</h6>
      {endContent}
    </div>
  );
}

function DashboardV2({ address }: { address: string }) {
  const [totalUsd, changes] = useBalanceTotalUsd(address);
  const [network, setNetwork] = useInputNetwork(undefined);
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshAssets = useCallback(async () => {
    if (isRefreshing || !address) return;

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
  }, [address, isRefreshing, queryClient]);

  return (
    <div className='w-full'>
      {/* Main Content Grid */}
      <div className='grid grid-cols-8 gap-5'>
        {/* Hero Section */}
        <div className='col-span-8 lg:col-span-5'>
          <Title>Overview</Title>

          <Hero address={address} totalUsd={totalUsd} changes={changes} />
        </div>

        {/* Favorite Dapps */}
        <div className='col-span-8 lg:col-span-3'>
          <Title
            endContent={
              <Button asChild variant='ghost' size='sm' className='h-[23px] px-[15px]'>
                <Link to='/dapp'>View All</Link>
              </Button>
            }
          >
            Favorite Dapps
          </Title>
          <FavoriteDapps />
        </div>

        {/* Assets */}
        <div className='col-span-8 lg:col-span-4'>
          <Title
            endContent={
              <Button asChild variant='ghost' size='sm' className='h-[23px] px-[15px]'>
                <Link to='/assets'>View All</Link>
              </Button>
            }
          >
            <div className='flex items-center gap-2.5'>
              Assets
              <Tooltip content='Refresh Asset List'>
                <Button
                  isIconOnly
                  variant='light'
                  size='sm'
                  onClick={refreshAssets}
                  disabled={isRefreshing || !address}
                >
                  <IconArrowClockWise className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                </Button>
              </Tooltip>
            </div>
          </Title>
          <Assets address={address} />
        </div>

        {/* Pending Transactions */}
        <div className='col-span-8 lg:col-span-4'>
          <Title
            endContent={
              <Button asChild variant='ghost' size='sm' className='h-[23px] px-[15px]'>
                <Link to='/transactions'>View All</Link>
              </Button>
            }
          >
            Pending Transaction
          </Title>
          <PendingTransactions address={address} />
        </div>

        {/* Account Structure */}
        <div className='col-span-8'>
          <Title>Account Strucuture</Title>
          <SubApiRoot network={network}>
            <AccountStructure address={address} setNetwork={setNetwork} />
          </SubApiRoot>
        </div>
      </div>
    </div>
  );
}

export default React.memo(DashboardV2);
