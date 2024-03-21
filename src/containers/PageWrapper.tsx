// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box } from '@mui/material';
import { useContext } from 'react';
import { Outlet } from 'react-router-dom';

import { BaseContainerCtx } from './BaseContainer';

export function PageWrapperMain() {
  const { alertOpen } = useContext(BaseContainerCtx);

  return (
    <Box sx={{ paddingTop: `calc(56px + 20px + ${alertOpen ? 24 : 0}px)`, paddingLeft: { md: 'calc(222px + 20px)', xs: 1.5 }, paddingRight: { md: '20px', xs: 1.5 }, paddingBottom: 4 }}>
      <Outlet />
    </Box>
  );
}

function PageWrapper() {
  const { alertOpen } = useContext(BaseContainerCtx);

  return (
    <Box sx={{ paddingTop: `calc(56px + 20px + ${alertOpen ? 24 : 0}px)`, paddingX: { md: 2, xs: 1.5 }, paddingBottom: 4 }}>
      <Outlet />
    </Box>
  );
}

export default PageWrapper;
