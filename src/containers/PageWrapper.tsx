// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';

function PageWrapper() {
  return (
    <Box sx={{ paddingY: 3, height: '100%', minHeight: '100vh', paddingTop: '56px' }}>
      <Outlet />
    </Box>
  );
}

export default PageWrapper;
