// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { getRouteApi, useNavigate } from '@tanstack/react-router';

import { Tab, Tabs } from '@mimir-wallet/ui';

import AppList from './AppList';
import CustomApps from './CustomApps';
import WalletConnectExample from './WalletConnectExample';

const routeApi = getRouteApi('/_authenticated/dapp');

function PageDapp() {
  const navigate = useNavigate();
  const search = routeApi.useSearch();
  const tab = search.tab;

  const handleTabChange = (key: string | number) => {
    const newTab = key.toString() as 'apps' | 'custom';

    navigate({
      to: '.',
      search: { ...search, tab: newTab }
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
          <AppList />
        </Tab>
        <Tab key='custom' title='Custom Apps'>
          <CustomApps />
        </Tab>
      </Tabs>
    </div>
  );
}

export default PageDapp;
