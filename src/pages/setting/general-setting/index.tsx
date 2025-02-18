// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Tab, Tabs } from '@mui/material';

import { useQueryParam } from '@mimir-wallet/hooks/useQueryParams';

import DisplaySetting from './display';
import NetworkSetting from './network';

function GeneralSetting() {
  const [tab, setTab] = useQueryParam('setting-tab', 'rpc');

  return (
    <>
      <Tabs value={tab} onChange={(_, value) => setTab(value)}>
        <Tab label='RPC' value='rpc' />
        <Tab label='Display' value='display' />
      </Tabs>

      {tab === 'rpc' && <NetworkSetting />}
      {tab === 'display' && <DisplaySetting />}
    </>
  );
}

export default GeneralSetting;
