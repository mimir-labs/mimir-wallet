// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useAccount } from '@/accounts/useAccount';
import { ConnectWalletModal, Navigate, ToastRoot, TxSubmit, TxToast } from '@/components';
import { MigrationAlert } from '@/features/assethub-migration';
import { useFollowAccounts } from '@/hooks/useFollowAccounts';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useTxQueue } from '@/hooks/useTxQueue';
import WalletConsumer from '@/wallet/Consumer';
import { useWallet } from '@/wallet/useWallet';
import { useCallback, useState } from 'react';
import { Outlet } from 'react-router-dom';

import { useApi } from '@mimir-wallet/polkadot-core';
import { SidebarProvider } from '@mimir-wallet/ui';

import AddAddressBook from './AddAddressBook';
import { AddressModalsProvider } from './address';
import { CSS_VARS, layoutHelpers } from './constants';
import Initializing from './Initializing';
import OmniChainUpgradeTip from './OmniChainUpgradeTip';
import { AppSidebar, RightSideBar } from './sidebar';
import SubscribeNotification from './SubscribeNotification';
import ToggleAlert from './ToggleAlert';
import TopBar from './topbar';
import Version from './Version';

interface BaseContainerProps {
  auth: boolean;
  skipConnect?: boolean;
  hideSideBar?: boolean;
  hideTopBar?: boolean;
  withPadding: boolean;
}

// Helper function for main content rendering
const shouldShowMainContent = (
  skipConnect: boolean,
  isApiReady: boolean,
  isWalletReady: boolean,
  isMultisigSyned: boolean
): boolean => {
  return skipConnect || (isApiReady && isWalletReady && isMultisigSyned);
};

// Global modals and components
const GlobalModalsAndComponents = () => (
  <>
    <ToastRoot />
    <TxToast />
    <WalletConsumer />
    <AddAddressBook />
    <OmniChainUpgradeTip />
    <SubscribeNotification />
  </>
);

// Top section component (TopBar + Alert)
interface TopSectionProps {
  hideTopBar?: boolean;
  current: string | null | undefined;
  setAlertOpen: (open: boolean) => void;
}

const TopSection = ({ hideTopBar, current, setAlertOpen }: TopSectionProps) => {
  const handleSetAlertOpen = useCallback(
    (open: boolean) => {
      setAlertOpen(open);
    },
    [setAlertOpen]
  );
  const [, setAlertCounts] = useState<number>(0);

  if (hideTopBar) return null;

  return (
    <>
      <TopBar />
      <div className='fixed top-[56px] right-0 left-0 z-50 flex w-full flex-col gap-2.5 p-2.5'>
        {current && <ToggleAlert address={current} setAlertOpen={handleSetAlertOpen} />}
        <MigrationAlert onMigrationCounts={setAlertCounts} />
      </div>
    </>
  );
};

// Transaction overlay component
interface TransactionOverlayProps {
  queue: any[];
}

const TransactionOverlay = ({ queue }: TransactionOverlayProps) => {
  if (queue.length === 0) return null;

  return (
    <div className='absolute inset-0 z-50 flex-auto'>
      <TxSubmit key={queue[0].id} {...queue[0]} />
    </div>
  );
};

// Content area component
interface ContentAreaProps {
  withPadding: boolean;
  hideTopBar?: boolean;
  isTransactionActive: boolean;
}

const ContentArea = ({ withPadding, hideTopBar, isTransactionActive }: ContentAreaProps) => {
  const contentStyle: React.CSSProperties = {
    display: isTransactionActive ? 'none' : 'flex',
    padding: withPadding ? undefined : 0
  };

  const versionStyle: React.CSSProperties = {
    padding: withPadding ? 0 : '0 0 16px 16px'
  };

  return (
    <div className='flex flex-1 flex-col gap-6 p-4 sm:p-5' style={contentStyle}>
      <div className='z-10 h-full flex-1'>
        <Outlet />
      </div>

      {!hideTopBar && (
        <div style={versionStyle}>
          <Version />
        </div>
      )}
    </div>
  );
};

// Main content component
interface MainContentProps {
  hideSideBar?: boolean;
  hideTopBar?: boolean;
  withPadding: boolean;
  alertOpen: boolean;
  queue: any[];
}

const MainContent = ({ hideSideBar, hideTopBar, withPadding, queue }: MainContentProps) => {
  const contentHeight = layoutHelpers.getContentHeight();
  const isTransactionActive = queue.length > 0;

  return (
    <div className='flex w-full flex-1' style={{ minHeight: contentHeight }}>
      {!hideSideBar && <AppSidebar />}

      <main
        className='relative flex flex-1 flex-col'
        style={{
          background: 'var(--color-main-bg)'
        }}
      >
        <ContentArea withPadding={withPadding} hideTopBar={hideTopBar} isTransactionActive={isTransactionActive} />

        <TransactionOverlay queue={queue} />
      </main>

      {!hideSideBar && <RightSideBar />}
    </div>
  );
};

function BaseContainer({ auth, skipConnect = false, withPadding, hideSideBar, hideTopBar }: BaseContainerProps) {
  const { isApiReady } = useApi();
  const { isWalletReady, closeWallet, walletOpen } = useWallet();
  const { current, isMultisigSyned } = useAccount();
  const { queue } = useTxQueue();
  const [alertOpen, setAlertOpen] = useState<boolean>(true);

  // Custom hooks for side effects
  useFollowAccounts();
  usePageTitle();

  // Early return for authentication check
  if (!current && auth) {
    return <Navigate to='/welcome' replace />;
  }

  // Check if main content should be displayed
  const showMainContent = shouldShowMainContent(skipConnect, isApiReady, isWalletReady, isMultisigSyned);

  // Sidebar provider styles
  const sidebarProviderStyle = {
    [CSS_VARS.HEADER_HEIGHT]: `${layoutHelpers.getTotalHeaderHeight()}px`
  } as React.CSSProperties;

  return (
    <>
      {/* Wallet Connection Modal */}
      <ConnectWalletModal onClose={closeWallet} open={walletOpen} />

      {/* Global Modals and Components */}
      <GlobalModalsAndComponents />

      {/* Address Modals Provider */}
      <AddressModalsProvider />

      <SidebarProvider className='flex flex-col [--header-height:calc(--spacing(14))]' style={sidebarProviderStyle}>
        {/* Top Section: TopBar + Alert */}
        <TopSection hideTopBar={hideTopBar} current={current} setAlertOpen={setAlertOpen} />

        {/* Main Content or Initialization */}
        {showMainContent ? (
          <MainContent
            hideSideBar={hideSideBar}
            hideTopBar={hideTopBar}
            withPadding={withPadding}
            alertOpen={alertOpen}
            queue={queue}
          />
        ) : (
          <div className='flex flex-1 items-center justify-center'>
            <Initializing />
          </div>
        )}
      </SidebarProvider>
    </>
  );
}

export default BaseContainer;
