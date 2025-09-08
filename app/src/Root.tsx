// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { WalletConnectProvider } from '@/features/wallet-connect';
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
      const { path, search, replace = false } = event.arguments;

      try {
        // Validate path parameter
        if (!path || typeof path !== 'string') {
          throw new Error('Invalid path parameter: path must be a non-empty string');
        }

        // Build the complete URL
        let fullPath = path.trim();

        // Ensure path starts with /
        if (!fullPath.startsWith('/')) {
          fullPath = `/${fullPath}`;
        }

        // Remove any double slashes
        fullPath = fullPath.replace(/\/+/g, '/');

        // Add search parameters if provided
        if (search && typeof search === 'object' && Object.keys(search).length > 0) {
          const searchParams = new URLSearchParams();

          Object.entries(search).forEach(([key, value]) => {
            // Only add non-empty values
            if (value !== undefined && value !== null && String(value).trim() !== '') {
              const cleanKey = String(key).trim();
              const cleanValue = String(value).trim();

              if (cleanKey) {
                searchParams.set(cleanKey, cleanValue);
              }
            }
          });

          const searchString = searchParams.toString();

          if (searchString) {
            fullPath += `?${searchString}`;
          }
        }

        // Validate final path format
        // eslint-disable-next-line no-useless-escape
        const pathPattern = /^\/[a-zA-Z0-9\-_\/]*(\?.*)?$/;

        if (!pathPattern.test(fullPath) && fullPath !== '/') {
          console.warn(`AI Navigation: Potentially invalid path format: ${fullPath}`);
        }

        // Perform navigation with error handling
        await new Promise<void>((resolve, reject) => {
          try {
            navigate(fullPath, { replace });
            // Give a small delay to ensure navigation completes
            setTimeout(resolve, 10);
          } catch (navError) {
            reject(navError);
          }
        });

        console.log(`AI Navigation: ${replace ? 'Replaced' : 'Navigated'} to ${fullPath}`);

        return {
          id: event.id,
          success: true,
          result: {
            path: fullPath,
            action: replace ? 'replace' : 'push',
            timestamp: new Date().toISOString()
          }
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown navigation error';

        console.error('AI Navigation Error:', {
          error: errorMessage,
          arguments: event.arguments,
          timestamp: new Date().toISOString()
        });

        return {
          id: event.id,
          success: false,
          error: `Navigation failed: ${errorMessage}`,
          details: {
            requestedPath: event.arguments.path,
            requestedSearch: event.arguments.search,
            timestamp: new Date().toISOString()
          }
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
