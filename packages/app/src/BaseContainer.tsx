// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';

import { GlobalStyle, MimirLoading } from '@mimirdev/react-components';
import { useApi } from '@mimirdev/react-hooks';

import SideBar from './SideBar';
import TopBar from './TopBar';

function BaseContainer() {
  const { isApiReady } = useApi();

  return (
    <>
      <GlobalStyle />
      <TopBar />
      {isApiReady && <SideBar />}
      {isApiReady ? (
        <Box sx={{ paddingTop: '56px', paddingLeft: '222px', height: '100%', background: 'linear-gradient(245.23deg, #F4F2FF 0%, #FBFDFF 100%)' }}>
          <Outlet />
        </Box>
      ) : (
        <Box
          sx={{
            background: 'linear-gradient(245.23deg, #F4F2FF 0%, #FBFDFF 100%)',
            position: 'absolute',
            left: 0,
            right: 0,
            top: 56,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <MimirLoading />
        </Box>
      )}
    </>
  );
}

export default BaseContainer;
