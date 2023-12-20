// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import NullImg from '@mimir-wallet/assets/images/Null.png';
import { Box, Typography } from '@mui/material';

function Empty({ height, label }: { label?: string; height: number | string }) {
  return (
    <Box sx={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 2 }}>
      <img src={NullImg} width={100} />
      <Typography variant='h4'>{label || 'No data here.'}</Typography>
    </Box>
  );
}

export default Empty;
