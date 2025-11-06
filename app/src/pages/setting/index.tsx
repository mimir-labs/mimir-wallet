// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { getRouteApi, useNavigate } from '@tanstack/react-router';

import { Tab, Tabs } from '@mimir-wallet/ui';

import AccountSetting from './account-setting';
import GeneralSetting from './general-setting';

const routeApi = getRouteApi('/_authenticated/setting');

function Setting() {
  const navigate = useNavigate();
  const search = routeApi.useSearch();
  const type = search.type || 'general';

  const handleTypeChange = (key: string | number) => {
    const newType = key.toString() as 'account' | 'general';

    navigate({
      to: '.',
      search: { ...search, type: newType }
    });
  };

  return (
    <div className='mx-auto flex w-[500px] max-w-full flex-col items-stretch gap-5'>
      <Tabs color='primary' aria-label='Setting' selectedKey={type as string} onSelectionChange={handleTypeChange}>
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
