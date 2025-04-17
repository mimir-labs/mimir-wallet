// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import LogoCircle from '@/assets/images/logo-circle.png';
import IconExternal from '@/assets/svg/icon-external-app.svg?react';
import { useDapp } from '@/hooks/useDapp';
import React, { useMemo } from 'react';

import { Avatar } from '@mimir-wallet/ui';

function AppName({
  website,
  iconSize = 20,
  iconUrl,
  appName,
  hiddenName
}: {
  website?: string | null;
  iconSize?: number;
  iconUrl?: string | null;
  appName?: string | null;
  hiddenName?: boolean;
}) {
  const app = useDapp(website);

  const [name, icon] = useMemo(() => {
    if (website) {
      if (website.startsWith('mimir://')) {
        return app
          ? [app.name, <img alt='mimir' src={app.icon} key={website} style={{ width: iconSize, height: iconSize }} />]
          : ['Mimir', <img alt='mimir' src={LogoCircle} style={{ width: iconSize, height: iconSize }} key={website} />];
      }

      const websiteURL = new URL(website);

      return app
        ? [app.name, <img alt='mimir' src={app.icon} key={website} style={{ width: iconSize, height: iconSize }} />]
        : [
            appName || websiteURL.hostname,
            iconUrl ? (
              <Avatar
                key={`avatar-${website}`}
                src={iconUrl}
                style={{ width: iconSize, height: iconSize, backgroundColor: 'transparent' }}
              />
            ) : (
              <IconExternal style={{ width: iconSize, height: iconSize }} className='text-primary/50' key={website} />
            )
          ];
    }

    return [
      'External',
      <IconExternal style={{ width: iconSize, height: iconSize }} className='text-primary/50' key='external' />
    ];
  }, [app, appName, iconSize, iconUrl, website]);

  return (
    <span className='inline-flex items-center gap-[5px] max-w-full'>
      <div className='flex flex-shrink-0'>{icon}</div>
      {!hiddenName && <span className='flex-grow overflow-hidden whitespace-nowrap text-ellipsis'>{name}</span>}
    </span>
  );
}

export default React.memo(AppName);
