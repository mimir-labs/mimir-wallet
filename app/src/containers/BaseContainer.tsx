// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import AccountConsumer from '@/accounts/Consumer';
import { useAccount } from '@/accounts/useAccount';
import { ConnectWalletModal, ToastRoot, TxSubmit, TxToast } from '@/components';
import { useApi } from '@/hooks/useApi';
import { useFollowAccounts } from '@/hooks/useFollowAccounts';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useTxQueue } from '@/hooks/useTxQueue';
import { useWallet } from '@/wallet/useWallet';
import { Box } from '@mui/material';
import { useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

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

          <div
            className='relative w-full flex-col gap-6 flex-1 p-4 sm:p-5'
            style={{
              display: queue.length > 0 ? 'none' : 'flex',
              padding: withPadding ? undefined : 0
            }}
          >
            <div className='h-full flex-1 z-10'>
              <Outlet />
            </div>
            <p className='z-0 absolute bottom-0 left-0 right-0 font-bold text-foreground/50 text-center'>
              Version: {process.env.VERSION}
            </p>
          </div>

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
