// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Tab, Tabs } from '@mimir-wallet/ui';
import { getRouteApi, useNavigate } from '@tanstack/react-router';

import AccountDisplay from './account-display';
import NetworkSetting from './network';
import NotificationSetting from './notification-setting';

import { useAccount } from '@/accounts/useAccount';

const routeApi = getRouteApi('/_authenticated/setting');

function GeneralSetting() {
  const { current } = useAccount();
  const navigate = useNavigate();
  const search = routeApi.useSearch();
  const tabs = search.tabs || 'network';

  const handleTabChange = (key: string | number) => {
    const newTab = key.toString() as 'network' | 'account-display' | 'notification';

    navigate({
      to: '.',
      search: { ...search, tabs: newTab }
    });
  };

  return (
    <div className='flex flex-col items-stretch gap-5'>
      <Tabs
        color='primary'
        aria-label='General Setting'
        variant='underlined'
        selectedKey={tabs}
        onSelectionChange={handleTabChange}
      >
        <Tab key='network' title='Network'>
          <NetworkSetting />
        </Tab>
        <Tab key='account-display' title='Account Display'>
          <AccountDisplay />
        </Tab>
        {current ? (
          <Tab key='notification' title='Notification'>
            <NotificationSetting address={current as `0x${string}`} />
          </Tab>
        ) : null}
      </Tabs>
    </div>
  );
}

export default GeneralSetting;
