// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import {
  Button,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from '@mimir-wallet/ui';
import { Link, useLocation } from '@tanstack/react-router';
import { memo, useCallback, useMemo } from 'react';
import { useToggle } from 'react-use';

import { LAYOUT } from '../constants';

import { AccountInfo, NavigationMenu, WalletSelector } from './components';

import { useSelectedAccount } from '@/accounts/useSelectedAccount';
import { AccountMenu } from '@/components';
import { useMimirLayout } from '@/hooks/useMimirLayout';
import { useWallet } from '@/wallet/useWallet';

/**
 * Main application sidebar component
 * Handles wallet connection, account selection, and navigation
 */
function AppSidebarComponent() {
  const selected = useSelectedAccount();
  const { connectedWallets, openWallet } = useWallet();
  const { closeSidebar, sidebarOpen, openSidebar } = useMimirLayout();
  const isConnected = useMemo(
    () => Object.keys(connectedWallets).length > 0,
    [connectedWallets],
  );
  const { pathname } = useLocation();
  const [accountOpen, toggleAccountOpen] = useToggle(false);

  const handleAccountOpen = useCallback(() => {
    toggleAccountOpen(true);
  }, [toggleAccountOpen]);

  const handleAccountClose = useCallback(() => {
    toggleAccountOpen(false);
  }, [toggleAccountOpen]);

  return (
    <>
      <Sidebar
        open={sidebarOpen}
        onOpenChange={(state) => (state ? openSidebar() : closeSidebar())}
        sideBarWidth={LAYOUT.SIDEBAR.LEFT_WIDTH}
        className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
      >
        {/* Header with account/wallet selection */}
        <SidebarHeader className="p-4">
          {pathname !== '/welcome' && (
            <>
              {isConnected ? (
                selected ? (
                  <AccountInfo
                    address={selected}
                    onAccountOpen={handleAccountOpen}
                  />
                ) : (
                  <Button
                    asChild
                    size="lg"
                    fullWidth
                    radius="md"
                    color="primary"
                    className="h-[48px]"
                  >
                    <Link to="/create-multisig">Create Multisig</Link>
                  </Button>
                )
              ) : (
                <Button
                  onClick={openWallet}
                  size="lg"
                  fullWidth
                  radius="md"
                  color="primary"
                  className="h-[48px]"
                >
                  Connect Wallet
                </Button>
              )}
            </>
          )}
        </SidebarHeader>

        {/* Main navigation content */}
        <SidebarContent className="flex flex-col gap-6 p-4">
          <NavigationMenu address={selected} />
        </SidebarContent>

        {/* Footer - could be used for additional actions */}
        <SidebarFooter className="p-4">
          <WalletSelector />
        </SidebarFooter>
      </Sidebar>

      {/* Account menu modal */}
      <AccountMenu open={accountOpen} onClose={handleAccountClose} />
    </>
  );
}

/**
 * Memoized AppSidebar component to optimize performance
 * Only re-renders when essential props change
 */
const AppSidebar = memo(AppSidebarComponent);

export default AppSidebar;
