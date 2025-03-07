// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AddressCell } from '@/components';
import { Box, Typography, useMediaQuery, useTheme } from '@mui/material';
import React from 'react';

function Sender({ address }: { address: string }) {
  const { breakpoints } = useTheme();
  const downMd = useMediaQuery(breakpoints.down('md'));

  return (
    <Box>
      <Typography fontWeight={700}>Sending From</Typography>
      <Box sx={{ display: 'flex', bgcolor: 'secondary.main', borderRadius: 0.5, padding: 1, marginTop: 0.8 }}>
        <AddressCell value={address} withCopy shorten={downMd} />
      </Box>
    </Box>
  );
}

export default React.memo(Sender);
