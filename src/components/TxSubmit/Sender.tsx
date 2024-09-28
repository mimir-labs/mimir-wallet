// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Typography } from '@mui/material';
import React from 'react';

import { AddressCell } from '@mimir-wallet/components';

function Sender({ address }: { address: string }) {
  return (
    <Box>
      <Typography fontWeight={700}>Sending From</Typography>
      <Box sx={{ display: 'flex', bgcolor: 'secondary.main', borderRadius: 0.5, padding: 1, marginTop: 0.8 }}>
        <AddressCell value={address} withCopy shorten={false} />
      </Box>
    </Box>
  );
}

export default React.memo(Sender);
