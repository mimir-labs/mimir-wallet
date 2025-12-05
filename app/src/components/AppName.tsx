// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Avatar } from '@mimir-wallet/ui';
import React, { useMemo } from 'react';

import LogoCircle from '@/assets/images/logo-circle.png';
import IconExternal from '@/assets/svg/icon-external-app.svg?react';
import { useDapp } from '@/hooks/useDapp';

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

      const displayName = appName || websiteURL.hostname.split('.').at(-2);
      const initials = displayName?.charAt(0).toUpperCase();

      return app
        ? [app.name, <img alt='mimir' src={app.icon} key={website} style={{ width: iconSize, height: iconSize }} />]
        : [
            displayName,
            iconUrl ? (
              <Avatar
                key={`avatar-${website}`}
                src={iconUrl}
                fallback={initials}
                style={{ width: iconSize, height: iconSize }}
                className='bg-primary/10'
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
    <span className='flex max-w-full items-center gap-[5px]'>
      <div className='flex shrink-0'>{icon}</div>
      {!hiddenName && <span className='grow overflow-hidden text-ellipsis whitespace-nowrap'>{name}</span>}
    </span>
  );
}

export default React.memo(AppName);
