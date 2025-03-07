// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import NullImg from '@/assets/images/Null.png';
import { Box } from '@mui/material';

function Empty({ height, label }: { label?: string; height: number | string }) {
  return (
    <Box
      sx={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 2 }}
    >
      <img alt='null' src={NullImg} width={100} />
      <h4>{label || 'No data here.'}</h4>
    </Box>
  );
}

export default Empty;
