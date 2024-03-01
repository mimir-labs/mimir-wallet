// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { DetectedMultisig, MimirLoading } from '@mimir-wallet/components';
import { useApi, useToggle } from '@mimir-wallet/hooks';
import { useWallet } from '@mimir-wallet/hooks/useWallet';
import { Box } from '@mui/material';
import { createContext } from 'react';
import { Outlet } from 'react-router-dom';

import TopBar from './TopBar';

interface State {
  sidebarOpen: boolean;
  openSidebar: () => void;
  closeSidebar: () => void;
}

export const BaseContainerCtx = createContext<State>({} as State);

function BaseContainer() {
  const { isApiConnected, isApiReady } = useApi();
  const { isMultisigSyned, isWalletReady } = useWallet();
  const [sidebarOpen, , setSidebarOpen] = useToggle(false);

  const openSidebar = () => setSidebarOpen(true);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <BaseContainerCtx.Provider value={{ sidebarOpen, openSidebar, closeSidebar }}>
      <TopBar />
      {isApiReady && isApiConnected && isWalletReady && isMultisigSyned ? (
        <Box sx={{ height: '100%' }}>
          <Outlet />
          <DetectedMultisig />
        </Box>
      ) : (
        <Box
          sx={{
            background: 'linear-gradient(245deg, #F4F2FF 0%, #FBFDFF 100%)',
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
    </BaseContainerCtx.Provider>
  );
}

export default BaseContainer;
