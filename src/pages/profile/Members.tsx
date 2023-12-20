// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AddressOverview } from '@mimir-wallet/components';
import { Paper } from '@mui/material';
import React from 'react';

function Members({ address }: { address?: string }) {
  return (
    <Paper sx={{ width: '100%', height: '40vh', borderRadius: 2 }}>
      <AddressOverview key={address} value={address} />
    </Paper>
  );
}

export default React.memo(Members);
