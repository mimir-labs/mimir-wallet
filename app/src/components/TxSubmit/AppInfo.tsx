// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AppName } from '@/components';
import React from 'react';

function AppInfo({
  website,
  iconUrl,
  appName
}: {
  website?: string | null;
  iconUrl?: string | null;
  appName?: string | null;
}) {
  if (website?.startsWith('mimir://internal')) {
    return null;
  }

  return (
    <div>
      <span className='font-bold'>App</span>
      <div className='bg-secondary rounded-small mt-2 flex p-2.5'>
        <AppName website={website} iconUrl={iconUrl} appName={appName} />
      </div>
    </div>
  );
}

export default React.memo(AppInfo);
