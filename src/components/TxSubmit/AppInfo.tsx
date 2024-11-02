// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Typography } from '@mui/material';
import React from 'react';

import { AppName } from '@mimir-wallet/components';

function AppInfo({
  website,
  iconUrl,
  appName
}: {
  website?: string | null;
  iconUrl?: string | null;
  appName?: string | null;
}) {
  if (website && website.startsWith('mimir://internal')) {
    return null;
  }

  return (
    <Box>
      <Typography fontWeight={700}>App</Typography>
      <Box sx={{ display: 'flex', bgcolor: 'secondary.main', borderRadius: 0.5, padding: 1, marginTop: 0.8 }}>
        <AppName website={website} iconUrl={iconUrl} appName={appName} />
      </Box>
    </Box>
  );
}

export default React.memo(AppInfo);
