// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Paper } from '@mui/material';
import React from 'react';

import { AddressOverview } from '@mimir-wallet/components';

function Members({ address }: { address?: string }) {
  return (
    <Paper sx={{ width: '100%', height: '40vh', borderRadius: 2 }}>
      <AddressOverview key={address} value={address} />
    </Paper>
  );
}

export default React.memo(Members);
