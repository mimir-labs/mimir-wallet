// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Spinner, Tab, Tabs } from '@mimir-wallet/ui';
import { getRouteApi, useNavigate } from '@tanstack/react-router';
import { lazy, Suspense, useTransition } from 'react';

import WalletConnectExample from './WalletConnectExample';

// Lazy load dapp list components for better code splitting
const AppList = lazy(() => import('./AppList'));
const CustomApps = lazy(() => import('./CustomApps'));

// Loading fallback for dapp lists
function DappListFallback() {
  return (
    <div className='flex h-64 items-center justify-center'>
      <Spinner variant='wave' />
    </div>
  );
}

const routeApi = getRouteApi('/_authenticated/dapp');

function PageDapp() {
  const navigate = useNavigate();
  const search = routeApi.useSearch();
  const tab = search.tab;

  // Use React 19 useTransition for non-blocking tab switches
  const [, startTransition] = useTransition();

  const handleTabChange = (key: string | number) => {
    const newTab = key.toString() as 'apps' | 'custom';

    // Wrap tab navigation in transition for smooth switching
    startTransition(() => {
      navigate({
        to: '.',
        search: { ...search, tab: newTab }
      });
    });
  };

  return (
    <div className='flex flex-col gap-5'>
      <WalletConnectExample />

      <Tabs
        color='primary'
        variant='solid'
        aria-label='Tabs'
        selectedKey={tab}
        onSelectionChange={handleTabChange}
        classNames={{
          tabList: ['bg-white', 'shadow-medium', 'rounded-[20px]', 'p-2.5'],
          tabContent: ['text-primary/50', 'font-bold'],
          cursor: ['rounded-[10px]']
        }}
      >
        <Tab key='apps' title='Apps'>
          <Suspense fallback={<DappListFallback />}>
            <AppList />
          </Suspense>
        </Tab>
        <Tab key='custom' title='Custom Apps'>
          <Suspense fallback={<DappListFallback />}>
            <CustomApps />
          </Suspense>
        </Tab>
      </Tabs>
    </div>
  );
}

export default PageDapp;
