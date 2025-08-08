// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useAccount } from '@/accounts/useAccount';
import { ConnectWalletModal, Navigate, ToastRoot, TxSubmit, TxToast } from '@/components';
import { useFollowAccounts } from '@/hooks/useFollowAccounts';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useTxQueue } from '@/hooks/useTxQueue';
import WalletConsumer from '@/wallet/Consumer';
import { useWallet } from '@/wallet/useWallet';
import { useState } from 'react';
import { Outlet } from 'react-router-dom';

import { useApi } from '@mimir-wallet/polkadot-core';

import CopyAddressModal from './address/CopyAddressModal';
import ExplorerAddressModal from './address/ExplorerAddressModal';
import QrAddressModal from './address/QrAddressModal';
import RightSideBar from './sidebar/RightSideBar';
import SideBar from './sidebar/SideBar';
import AddAddressBook from './AddAddressBook';
import Initializing from './Initializing';
import OmniChainUpgradeTip from './OmniChainUpgradeTip';
import SubscribeNotification from './SubscribeNotification';
import ToggleAlert from './ToggleAlert';
import TopBar from './topbar';
import Version from './Version';
import ViewCallData from './ViewCallData';

function BaseContainer({
  auth,
  skipConnect = false,
  withSideBar,
  withPadding,
  hideSideBar,
  hideTopBar
}: {
  auth: boolean;
  skipConnect?: boolean;
  hideSideBar?: boolean;
  hideTopBar?: boolean;
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

  const alertHeight = alertOpen ? 38 : 0;

  return (
    <>
      <ConnectWalletModal onClose={closeWallet} open={walletOpen} />
      <ToastRoot />
      <TxToast />
      <WalletConsumer />
      <AddAddressBook />
      <OmniChainUpgradeTip />
      <SubscribeNotification />
      {hideTopBar ? null : <TopBar />}
      {isApiReady && isWalletReady && isMultisigSyned && current && (
        <>
          {hideTopBar ? null : <ToggleAlert address={current} setAlertOpen={setAlertOpen} />}
          <ViewCallData />
          <CopyAddressModal />
          <QrAddressModal />
          <ExplorerAddressModal />
        </>
      )}

      {skipConnect || (isApiReady && isWalletReady && isMultisigSyned) ? (
        <div
          className='flex w-full'
          style={{
            minHeight: hideSideBar ? '100dvh' : `calc(100dvh - 1px - ${alertHeight}px - 56px)`
          }}
        >
          {hideSideBar ? null : <SideBar offsetTop={alertHeight} withSideBar={withSideBar} />}

          <div
            className='relative w-full flex-1 flex-col gap-6 p-4 sm:p-5'
            style={{
              display: queue.length > 0 ? 'none' : 'flex',
              padding: withPadding ? undefined : 0
            }}
          >
            <div className='z-10 h-full flex-1'>
              <Outlet />
            </div>
            {hideTopBar ? null : (
              <div style={{ padding: withPadding ? 0 : '0 0 16px 16px' }}>
                <Version />
              </div>
            )}
          </div>

          {queue.length > 0 ? (
            <div
              className='relative z-50 flex-auto'
              style={{
                background: 'linear-gradient(245deg, #F4F2FF 0%, #FBFDFF 100%)'
              }}
            >
              <TxSubmit {...queue[0]} />
            </div>
          ) : null}

          <RightSideBar offsetTop={alertHeight} />
        </div>
      ) : (
        <div>
          <Initializing />
        </div>
      )}
    </>
  );
}

export default BaseContainer;
