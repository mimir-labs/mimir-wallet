// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useBalanceTotalUsd } from '@/hooks/useBalances';
import { useInputNetwork } from '@/hooks/useInputNetwork';
import React from 'react';

import { SubApiRoot } from '@mimir-wallet/polkadot-core';
import { Button, Link } from '@mimir-wallet/ui';

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
              <Button as={Link} href='/dapp' variant='ghost' size='sm' className='h-[23px] px-[15px]'>
                View All
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
              <Button as={Link} href='/assets' variant='ghost' size='sm' className='h-[23px] px-[15px]'>
                View All
              </Button>
            }
          >
            Assets
          </Title>
          <Assets address={address} />
        </div>

        {/* Pending Transactions */}
        <div className='col-span-8 lg:col-span-4'>
          <Title
            endContent={
              <Button as={Link} href='/transactions' variant='ghost' size='sm' className='h-[23px] px-[15px]'>
                View All
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
