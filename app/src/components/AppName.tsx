// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import LogoCircle from '@/assets/images/logo-circle.png';
import IconExternal from '@/assets/svg/icon-external-app.svg?react';
import { useDapp } from '@/hooks/useDapp';
import { alpha, Avatar, Box, SvgIcon } from '@mui/material';
import React, { useMemo } from 'react';

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
              <Avatar key={`avatar-${website}`} src={iconUrl} style={{ width: iconSize, height: iconSize }} />
            ) : (
              <SvgIcon
                component={IconExternal}
                inheritViewBox
                sx={({ palette }) => ({ width: iconSize, height: iconSize, color: alpha(palette.primary.main, 0.5) })}
                key={website}
              />
            )
          ];
    }

    return [
      'External',
      <SvgIcon
        component={IconExternal}
        inheritViewBox
        sx={({ palette }) => ({ width: iconSize, height: iconSize, color: alpha(palette.primary.main, 0.5) })}
        key='external'
      />
    ];
  }, [app, appName, iconSize, iconUrl, website]);

  return (
    <Box component='span' sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, maxWidth: '100%' }}>
      <Box sx={{ display: 'flex', flexShrink: '0' }}>{icon}</Box>
      {!hiddenName && (
        <Box
          component='span'
          sx={{ flexGrow: '1', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}
        >
          {name}
        </Box>
      )}
    </Box>
  );
}

export default React.memo(AppName);
