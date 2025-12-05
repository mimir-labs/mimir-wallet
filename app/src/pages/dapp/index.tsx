// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Spinner, Tabs } from '@mimir-wallet/ui';
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
      <Spinner variant='ellipsis' />
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

  const handleTabChange = (key: string) => {
    const newTab = key as 'apps' | 'custom';

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
        tabs={[
          { key: 'apps', label: 'Apps' },
          { key: 'custom', label: 'Custom Apps' }
        ]}
        selectedKey={tab}
        onSelectionChange={handleTabChange}
      />

      {tab === 'apps' && (
        <Suspense fallback={<DappListFallback />}>
          <AppList />
        </Suspense>
      )}
      {tab === 'custom' && (
        <Suspense fallback={<DappListFallback />}>
          <CustomApps />
        </Suspense>
      )}
    </div>
  );
}

export default PageDapp;
