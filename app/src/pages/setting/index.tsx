// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useNavigate } from 'react-router-dom';

import { Tab, Tabs } from '@mimir-wallet/ui';

import AccountSetting from './account-setting';
import GeneralSetting from './general-setting';

function Setting({ type }: { type: 'general' | 'account' }) {
  const navigate = useNavigate();

  return (
    <div className='mx-auto flex w-[500px] max-w-full flex-col items-stretch gap-5'>
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
          <GeneralSetting />
        </Tab>
      </Tabs>

      <div className='h-5' />
    </div>
  );
}

export default Setting;
