// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Tab, Tabs } from '@mimir-wallet/ui';

import AccountDisplay from './account-display';
import NetworkSetting from './network';

function GeneralSetting() {
  return (
    <div className='flex flex-col items-stretch gap-5'>
      <Tabs color='primary' aria-label='General Setting' variant='underlined'>
        <Tab key='network' title='Network'>
          <NetworkSetting />
        </Tab>
        <Tab key='account-display' title='Account Display'>
          <AccountDisplay />
        </Tab>
      </Tabs>
    </div>
  );
}

export default GeneralSetting;
