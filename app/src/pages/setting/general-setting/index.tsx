// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useAccount } from '@/accounts/useAccount';
import { useQueryParam } from '@/hooks/useQueryParams';

import { Tab, Tabs } from '@mimir-wallet/ui';

import AccountDisplay from './account-display';
import NetworkSetting from './network';
import NotificationSetting from './notification-setting';

function GeneralSetting() {
  const { current } = useAccount();
  const [tab, setTab] = useQueryParam<string>('tabs', 'network');

  return (
    <div className='flex flex-col items-stretch gap-5'>
      <Tabs
        color='primary'
        aria-label='General Setting'
        variant='underlined'
        selectedKey={tab}
        onSelectionChange={(key) => setTab(key.toString())}
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
