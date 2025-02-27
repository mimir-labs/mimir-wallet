// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Typography } from '@mui/material';
import { useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

import AccountConsumer from '@mimir-wallet/accounts/Consumer';
import { useAccount } from '@mimir-wallet/accounts/useAccount';
import { ConnectWalletModal, SwitchAccountDialog, ToastRoot, TxSubmit, TxToast } from '@mimir-wallet/components';
import { useApi } from '@mimir-wallet/hooks/useApi';
import { useFollowAccounts } from '@mimir-wallet/hooks/useFollowAccounts';
import { usePageTitle } from '@mimir-wallet/hooks/usePageTitle';
import { useTxQueue } from '@mimir-wallet/hooks/useTxQueue';
import { useWallet } from '@mimir-wallet/wallet/useWallet';

import RightSideBar from './sidebar/RightSideBar';
import SideBar from './sidebar/SideBar';
import AddAddressBook from './AddAddressBook';
import Initializing from './Initializing';
import SubscribeTx from './SubscribeTx';
import ToggleAlert from './ToggleAlert';
import TopBar from './topbar';
import ViewCallData from './ViewCallData';

function BaseContainer({
  auth,
  skipConnect = false,
  withSideBar,
  withPadding
}: {
  auth: boolean;
  skipConnect?: boolean;
  withSideBar: boolean;
  withPadding: boolean;
}) {
  const { isApiReady } = useApi();
  const { isWalletReady, closeWallet, walletOpen } = useWallet();
  const { current, isMultisigSyned } = useAccount();
  const { queue } = useTxQueue();
  const [alertOpen, setAlertOpen] = useState<boolean>(true);

  useFollowAccounts();
  usePageTitle();

  if (!current && auth) {
    return <Navigate to='/welcome' replace />;
  }

  return (
    <>
      <ConnectWalletModal onClose={closeWallet} open={walletOpen} />
      <ToastRoot />
      <TxToast />
      <AccountConsumer />
      <AddAddressBook />
      <SwitchAccountDialog />

      <TopBar />

      {isApiReady && isWalletReady && isMultisigSyned && current && (
        <>
          <ToggleAlert address={current} setAlertOpen={setAlertOpen} />
          <SubscribeTx address={current} />
          <ViewCallData />
        </>
      )}

      {skipConnect || (isApiReady && isWalletReady && isMultisigSyned) ? (
        <Box
          sx={{
            display: 'flex',
            minHeight: `calc(100dvh - ${alertOpen ? 38 : 0}px - 1px - 56px)`,
            width: '100%'
          }}
        >
          <SideBar offsetTop={alertOpen ? 38 : 0} withSideBar={withSideBar} />

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

          <RightSideBar offsetTop={alertOpen ? 38 : 0} />
        </Box>
      ) : (
        <Initializing />
      )}
    </>
  );
}

export default BaseContainer;
