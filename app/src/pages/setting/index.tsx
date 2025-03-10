// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useNavigate } from 'react-router-dom';

import { Tab, Tabs } from '@mimir-wallet/ui';

import AccountSetting from './account-setting';
import NetworkSetting from './network';

function Setting({ type }: { type: 'general' | 'account' }) {
  const navigate = useNavigate();

  return (
    <div className='max-w-full w-[500px] mx-auto flex flex-col gap-5 items-stretch'>
      <Tabs
        color='primary'
        aria-label='Setting'
        selectedKey={type}
        onSelectionChange={(key) => {
          if (key === 'account') {
            navigate('/account-setting');
          } else {
            navigate('/setting');
          }
        }}
      >
        <Tab key='account' title='Wallet Setting'>
          <AccountSetting />
        </Tab>
        <Tab key='general' title='General Setting'>
          <NetworkSetting />
        </Tab>
      </Tabs>

      <div className='h-5' />
    </div>
  );
}

export default Setting;
