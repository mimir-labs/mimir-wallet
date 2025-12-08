// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Tabs } from '@mimir-wallet/ui';
import { getRouteApi, useNavigate } from '@tanstack/react-router';
import { useTransition } from 'react';

import AppList from './AppList';
import CustomApps from './CustomApps';
import WalletConnectExample from './WalletConnectExample';

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
        search: { ...search, tab: newTab },
      });
    });
  };

  return (
    <div className="flex flex-col gap-5">
      <WalletConnectExample />

      <Tabs
        tabs={[
          { key: 'apps', label: 'Apps' },
          { key: 'custom', label: 'Custom Apps' },
        ]}
        selectedKey={tab}
        onSelectionChange={handleTabChange}
      />

      {tab === 'apps' && <AppList />}
      {tab === 'custom' && <CustomApps />}
    </div>
  );
}

export default PageDapp;
