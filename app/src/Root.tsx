// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { WalletConnectProvider } from '@/features/wallet-connect';
import { useHref, useNavigate } from 'react-router-dom';

import { QueryProvider, TransactionSocketProvider } from '@mimir-wallet/service';
import { HeroUIProvider } from '@mimir-wallet/ui';

import AccountConsumer from './accounts/Consumer';

/**
 * Root Component
 *
 * This component provides the foundational providers and configuration for the application:
 * - Custom ThemeProvider for consistent styling
 * - React Query configuration for data fetching and caching
 * - Global styles
 *
 * The QueryClient is configured with:
 * - Auto-refetch interval of 6 seconds
 * - Custom fetcher function for data queries
 */
function Root({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  return (
    <HeroUIProvider navigate={navigate} useHref={useHref}>
      <QueryProvider>
        <AccountConsumer>
          <WalletConnectProvider>
            <TransactionSocketProvider path='/notification-push'>{children}</TransactionSocketProvider>
          </WalletConnectProvider>
        </AccountConsumer>
      </QueryProvider>
    </HeroUIProvider>
  );
}

export default Root;
