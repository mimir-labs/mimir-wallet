// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';

export function PageWrapperMain() {
  return (
    <Box sx={{ paddingTop: 'calc(56px + 20px)', paddingLeft: { md: 'calc(222px + 20px)', xs: 1.5 }, paddingRight: { md: '20px', xs: 1.5 }, paddingBottom: 4 }}>
      <Outlet />
    </Box>
  );
}

function PageWrapper() {
  return (
    <Box sx={{ paddingTop: 'calc(56px + 20px)', paddingX: { md: 2, xs: 1.5 }, paddingBottom: 4 }}>
      <Outlet />
    </Box>
  );
}

export default PageWrapper;
