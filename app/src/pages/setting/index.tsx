// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Spinner, Tabs } from '@mimir-wallet/ui';
import { getRouteApi, useNavigate } from '@tanstack/react-router';
import { lazy, Suspense, useTransition } from 'react';

// Lazy load setting components for better code splitting
const AccountSetting = lazy(() => import('./account-setting'));
const GeneralSetting = lazy(() => import('./general-setting'));

// Loading fallback for settings
function SettingFallback() {
  return (
    <div className='flex h-64 items-center justify-center'>
      <Spinner variant='ellipsis' />
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

  const handleTypeChange = (key: string) => {
    const newType = key as 'account' | 'general';

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
      <Tabs
        tabs={[
          { key: 'account', label: 'Wallet Setting' },
          { key: 'general', label: 'General Setting' }
        ]}
        selectedKey={type as string}
        onSelectionChange={handleTypeChange}
      />

      {type === 'account' && (
        <Suspense fallback={<SettingFallback />}>
          <AccountSetting />
        </Suspense>
      )}
      {type === 'general' && (
        <Suspense fallback={<SettingFallback />}>
          <GeneralSetting />
        </Suspense>
      )}

      <div className='h-5' />
    </div>
  );
}

export default Setting;
