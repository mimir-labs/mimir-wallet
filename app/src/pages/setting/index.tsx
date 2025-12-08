// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Tabs } from '@mimir-wallet/ui';
import { getRouteApi, useNavigate } from '@tanstack/react-router';
import { useTransition } from 'react';

import AccountSetting from './account-setting';
import GeneralSetting from './general-setting';

const routeApi = getRouteApi('/_authenticated/setting');

function Setting() {
  const navigate = useNavigate();
  const search = routeApi.useSearch();
  const type = search.type || 'general';

  // Use React 19 useTransition for non-blocking tab switches
  const [, startTransition] = useTransition();

  const handleTypeChange = (key: string) => {
    const newType = key as 'account' | 'general';

    // Wrap tab navigation in transition for smooth switching
    startTransition(() => {
      navigate({
        to: '.',
        search: { ...search, type: newType },
      });
    });
  };

  return (
    <div className="mx-auto flex w-[500px] max-w-full flex-col items-stretch gap-5">
      <Tabs
        tabs={[
          { key: 'account', label: 'Wallet Setting' },
          { key: 'general', label: 'General Setting' },
        ]}
        selectedKey={type as string}
        onSelectionChange={handleTypeChange}
      />

      {type === 'account' && <AccountSetting />}
      {type === 'general' && <GeneralSetting />}

      <div className="h-5" />
    </div>
  );
}

export default Setting;
