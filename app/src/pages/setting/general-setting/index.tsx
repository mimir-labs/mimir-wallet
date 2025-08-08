// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useAccount } from '@/accounts/useAccount';

import { Tab, Tabs } from '@mimir-wallet/ui';

import AccountDisplay from './account-display';
import NetworkSetting from './network';
import NotificationSetting from './notification-setting';

function GeneralSetting() {
  const { current } = useAccount();

  return (
    <div className='flex flex-col items-stretch gap-5'>
      <Tabs color='primary' aria-label='General Setting' variant='underlined'>
        <Tab key='network' title='Network'>
          <NetworkSetting />
        </Tab>
        <Tab key='account-display' title='Account Display'>
          <AccountDisplay />
        </Tab>
        {current ? (
          <Tab key='notification' title='Notification'>
            <NotificationSetting address={current} />
          </Tab>
        ) : null}
      </Tabs>
    </div>
  );
}

export default GeneralSetting;
