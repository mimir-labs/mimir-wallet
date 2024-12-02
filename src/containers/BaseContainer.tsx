// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Typography } from '@mui/material';
import { createContext, useCallback, useMemo, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

import { ConnectWalletModal, MimirLoading, SwitchAccountDialog, TxSubmit } from '@mimir-wallet/components';
import { useAccount, useApi, useFollowAccounts, useToggle, useTxQueue } from '@mimir-wallet/hooks';
import { useWallet } from '@mimir-wallet/hooks/useWallet';

import SideBar from './SideBar';
import SubscribeTx from './SubscribeTx';
import ToggleAlert from './ToggleAlert';
import TopBar from './TopBar';

interface State {
  sidebarOpen: boolean;
  alertOpen: boolean;
  openSidebar: () => void;
  closeSidebar: () => void;
}

export const BaseContainerCtx = createContext<State>({} as State);

function BaseContainer({
  auth,
  withSideBar,
  withPadding
}: {
  auth: boolean;
  withSideBar: boolean;
  withPadding: boolean;
}) {
  const { isApiConnected, isApiReady } = useApi();
  const { isWalletReady, closeWallet, walletOpen } = useWallet();
  const { current, isMultisigSyned } = useAccount();
  const { queue } = useTxQueue();
  const [sidebarOpen, , setSidebarOpen] = useToggle(false);
  const [alertOpen, setAlertOpen] = useState<boolean>(true);

  const openSidebar = useCallback(() => setSidebarOpen(true), [setSidebarOpen]);
  const closeSidebar = useCallback(() => setSidebarOpen(false), [setSidebarOpen]);

  const value = useMemo(
    () => ({ alertOpen, sidebarOpen, openSidebar, closeSidebar }),
    [alertOpen, closeSidebar, openSidebar, sidebarOpen]
  );

  useFollowAccounts();

  if (!current && auth) {
    return <Navigate to='/welcome' replace />;
  }

  return (
    <BaseContainerCtx.Provider value={value}>
      <ConnectWalletModal onClose={closeWallet} open={walletOpen} />

      <SwitchAccountDialog />

      <TopBar />

      {isApiReady && isApiConnected && isWalletReady && isMultisigSyned && current && (
        <>
          <ToggleAlert address={current} setAlertOpen={setAlertOpen} />
          <SubscribeTx address={current} />
        </>
      )}

      {isApiReady && isApiConnected && isWalletReady && isMultisigSyned ? (
        <Box
          sx={{
            display: 'flex',
            minHeight: `calc(100dvh - ${alertOpen ? 37 : 0}px - 1px - 56px)`
          }}
        >
          <SideBar offsetTop={alertOpen ? 36 : 0} withSideBar={withSideBar} />

          <Box
            sx={{
              width: '100%',
              display: queue.length > 0 ? 'none' : 'flex',
              flexDirection: 'column',
              gap: 3,
              flex: '1',
              padding: withPadding ? { xs: 1.5, md: 2 } : 0
            }}
          >
            <Box sx={{ flex: 1 }}>
              <Outlet />
            </Box>
            <Typography sx={{ fontWeight: 700, color: 'text.secondary', textAlign: 'center' }}>
              Version: {process.env.VERSION}
            </Typography>
          </Box>

          {queue.length > 0 ? (
            <Box
              sx={() => ({
                zIndex: 1200,
                flex: '1',
                position: 'relative',
                background: 'linear-gradient(245deg, #F4F2FF 0%, #FBFDFF 100%)'
              })}
            >
              <TxSubmit {...queue[0]} />
            </Box>
          ) : null}
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
