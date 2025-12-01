// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Spinner, Tab, Tabs } from '@mimir-wallet/ui';
import { getRouteApi, useNavigate } from '@tanstack/react-router';
import { lazy, Suspense, useTransition } from 'react';

// Lazy load setting components for better code splitting
const AccountSetting = lazy(() => import('./account-setting'));
const GeneralSetting = lazy(() => import('./general-setting'));

// Loading fallback for settings
function SettingFallback() {
  return (
    <div className='flex h-64 items-center justify-center'>
      <Spinner variant='wave' />
    </div>
  );
}

const routeApi = getRouteApi('/_authenticated/setting');

function Setting() {
  const navigate = useNavigate();
  const search = routeApi.useSearch();
  const type = search.type || 'general';

  // Use React 19 useTransition for non-blocking tab switches
  const [, startTransition] = useTransition();

  const handleTypeChange = (key: string | number) => {
    const newType = key.toString() as 'account' | 'general';

    // Wrap tab navigation in transition for smooth switching
    startTransition(() => {
      navigate({
        to: '.',
        search: { ...search, type: newType }
      });
    });
  };

  return (
    <div className='mx-auto flex w-[500px] max-w-full flex-col items-stretch gap-5'>
      <Tabs color='primary' aria-label='Setting' selectedKey={type as string} onSelectionChange={handleTypeChange}>
        <Tab key='account' title='Wallet Setting'>
          <Suspense fallback={<SettingFallback />}>
            <AccountSetting />
          </Suspense>
        </Tab>
        <Tab key='general' title='General Setting'>
          <Suspense fallback={<SettingFallback />}>
            <GeneralSetting />
          </Suspense>
        </Tab>
      </Tabs>

      <div className='h-5' />
    </div>
  );
}

export default Setting;
