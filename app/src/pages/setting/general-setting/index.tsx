// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Tabs } from '@mimir-wallet/ui';
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

  const handleTabChange = (key: string) => {
    const newTab = key as 'network' | 'account-display' | 'notification';

    navigate({
      to: '.',
      search: { ...search, tabs: newTab },
    });
  };

  return (
    <div className="flex flex-col items-stretch gap-5">
      <Tabs
        variant="underlined"
        tabs={
          current
            ? [
                { key: 'network', label: 'Network' },
                { key: 'account-display', label: 'Account Display' },
                { key: 'notification', label: 'Notification' },
              ]
            : [
                { key: 'network', label: 'Network' },
                { key: 'account-display', label: 'Account Display' },
              ]
        }
        selectedKey={tabs}
        onSelectionChange={handleTabChange}
      />

      {tabs === 'network' && <NetworkSetting />}
      {tabs === 'account-display' && <AccountDisplay />}
      {tabs === 'notification' && current && (
        <NotificationSetting address={current as `0x${string}`} />
      )}
    </div>
  );
}

export default GeneralSetting;
