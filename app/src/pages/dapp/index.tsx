// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useQueryParam } from '@/hooks/useQueryParams';

import { Tab, Tabs } from '@mimir-wallet/ui';

import AppList from './AppList';
import CustomApps from './CustomApps';
import WalletConnectExample from './WalletConnectExample';

function PageDapp() {
  const [tab, setTab] = useQueryParam<string>('tab', 'apps');

  return (
    <div className='flex flex-col gap-5'>
      <WalletConnectExample />

      <Tabs
        color='primary'
        variant='solid'
        aria-label='Tabs'
        selectedKey={tab}
        onSelectionChange={(key) => setTab(key.toString())}
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
