// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { WalletConnectProvider } from '@/features/wallet-connect';
import { resolveIntentToRoute, sanitizePath } from '@/utils/navigation';
import { useHref, useNavigate } from 'react-router-dom';

import { type FunctionCallHandler, useFunctionCall } from '@mimir-wallet/ai-assistant';
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

  // Global navigation function call handlers
  const globalHandlers: Record<string, FunctionCallHandler> = {
    navigateTo: async (event) => {
      const { path, replace = false } = event.arguments;

      try {
        // Try to resolve intent to route first
        const targetPath = typeof path === 'string' ? resolveIntentToRoute(path) || path : String(path);

        // Sanitize the path
        const sanitizedPath = sanitizePath(targetPath);

        if (!sanitizedPath) {
          return {
            id: event.id,
            success: false,
            error: `Invalid or unsafe path: ${path}`
          };
        }

        // Perform navigation
        navigate(sanitizedPath, { replace });

        console.log(`AI Navigation: ${replace ? 'Replaced' : 'Navigated'} to ${sanitizedPath}`);

        return {
          id: event.id,
          success: true,
          result: {
            path: sanitizedPath,
            action: replace ? 'replace' : 'push'
          }
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown navigation error';

        console.error('Navigation error:', error);

        return {
          id: event.id,
          success: false,
          error: errorMessage
        };
      }
    },

    goBack: async (event) => {
      const { steps = 1 } = event.arguments;

      try {
        // Navigate back the specified number of steps
        navigate(-Math.abs(Number(steps) || 1));

        console.log(`AI Navigation: Went back ${steps} step(s)`);

        return {
          id: event.id,
          success: true,
          result: { steps: Math.abs(Number(steps) || 1) }
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown go back error';

        console.error('Go back error:', error);

        return {
          id: event.id,
          success: false,
          error: errorMessage
        };
      }
    }
  };

  // Register global function call handlers
  useFunctionCall(globalHandlers);

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
