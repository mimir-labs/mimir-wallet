// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { MimirLoading, TxModal } from '@mimir-wallet/components';
import { useApi, useToggle } from '@mimir-wallet/hooks';
import { useWallet } from '@mimir-wallet/hooks/useWallet';
import { Box } from '@mui/material';
import React, { createContext, useCallback, useState } from 'react';
import { Outlet } from 'react-router-dom';

import DetectedMultisig from './DetectedMultisig';
import SideBar from './SideBar';
import ToggleAlert from './ToggleAlert';
import TopBar from './TopBar';

interface State {
  sidebarOpen: boolean;
  alertOpen: boolean;
  openSidebar: () => void;
  closeSidebar: () => void;
}

export const BaseContainerCtx = createContext<State>({} as State);

function BaseContainer({ fixedSidebar }: { fixedSidebar: boolean }) {
  const { isApiConnected, isApiReady } = useApi();
  const { isMultisigSyned, isWalletReady } = useWallet();
  const [sidebarOpen, , setSidebarOpen] = useToggle(false);
  const [alertOpen, setAlertOpen] = useState<boolean>(false);

  const openSidebar = useCallback(() => setSidebarOpen(true), [setSidebarOpen]);
  const closeSidebar = useCallback(() => setSidebarOpen(false), [setSidebarOpen]);

  return (
    <BaseContainerCtx.Provider value={{ alertOpen, sidebarOpen, openSidebar, closeSidebar }}>
      <TxModal />
      <TopBar />
      {isApiReady && isApiConnected && isWalletReady && isMultisigSyned ? (
        <Box
          sx={{
            minHeight: '100%'
          }}
        >
          <ToggleAlert setAlertOpen={setAlertOpen} />
          <SideBar fixed={fixedSidebar} />
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
