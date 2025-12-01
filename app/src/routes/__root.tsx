// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { TransactionSocketProvider } from '@mimir-wallet/service';
import { HeroUIProvider } from '@mimir-wallet/ui';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { createRootRoute, Outlet, retainSearchParams, useRouter } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { zodValidator } from '@tanstack/zod-adapter';
import { z } from 'zod';

import AccountConsumer from '../accounts/Consumer';
import AddAddressBook from '../containers/AddAddressBook';
import OmniChainUpgradeTip from '../containers/OmniChainUpgradeTip';
import SubscribeNotification from '../containers/SubscribeNotification';

import { ConnectWalletModal, ToastRoot, TxToast } from '@/components';
import { DraggableChatWithFAB } from '@/components/DraggableChat';
import { WalletConnectProvider } from '@/features/wallet-connect';
import WalletConsumer from '@/wallet/Consumer';
import { useWallet } from '@/wallet/useWallet';

const searchSchema = z.looseObject({
  address: z.string().optional(),
  network: z.string().optional()
});

// Global modals and components
const GlobalModalsAndComponents = () => {
  const { closeWallet, walletOpen } = useWallet();

  return (
    <>
      <ToastRoot />
      <TxToast />
      <WalletConsumer />
      <AddAddressBook />
      <OmniChainUpgradeTip />
      <SubscribeNotification />
      <DraggableChatWithFAB />
      <ConnectWalletModal onClose={closeWallet} open={walletOpen} />
    </>
  );
};

/**
 * Root Route Component
 *
 * This component provides the foundational providers and configuration for the application:
 * - Custom ThemeProvider for consistent styling
 * - React Query configuration for data fetching and caching
 * - Global styles
 *
 * The QueryClient is configured with:
 * - Auto-refetch interval of 6 seconds
 * - Custom fetcher function for data queries
 *
 * Global Search Parameters (automatically retained across all navigations):
 * - address: Current selected address (string, optional)
 * - network: Current selected network (string, optional)
 *
 * These parameters are preserved using retainSearchParams middleware,
 * ensuring they persist across all route changes.
 *
 * The beforeLoad hook initializes search params from localStorage if they're
 * not present in the URL, following TanStack Router best practices.
 */
export const Route = createRootRoute({
  validateSearch: zodValidator(searchSchema),
  search: {
    middlewares: [retainSearchParams(['address', 'network'])]
  },
  component: RootComponent
});

function RootComponent() {
  // Note: HeroUIProvider from @heroui/system may expect navigate/useHref props
  // If it does, we'll need to provide TanStack Router equivalents
  // For now, we'll use it without those props and see if it works
  const router = useRouter();

  return (
    <HeroUIProvider
      navigate={(to, options: unknown) => router.navigate({ to, ...(options as object) })}
      useHref={(to) => router.buildLocation({ to }).href}
    >
      <AccountConsumer>
        <WalletConnectProvider>
          <TransactionSocketProvider path='/notification-push'>
            <Outlet />
            <GlobalModalsAndComponents />
            {import.meta.env.DEV && <TanStackRouterDevtools />}
            {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
          </TransactionSocketProvider>
        </WalletConnectProvider>
      </AccountConsumer>
    </HeroUIProvider>
  );
}
