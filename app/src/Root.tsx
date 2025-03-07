// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { GlobalStyle } from '@/components';
import { ThemeProvider } from '@/theme';
import { fetcher } from '@/utils';
import { StyledEngineProvider } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { HeroUIProvider } from '@mimir-wallet/ui';

/**
 * Root Component
 *
 * This component provides the foundational providers and configuration for the application:
 * - Material-UI's StyledEngineProvider for CSS injection order
 * - Custom ThemeProvider for consistent styling
 * - React Query configuration for data fetching and caching
 * - Global toast notifications
 * - Global styles
 *
 * The QueryClient is configured with:
 * - Auto-refetch interval of 6 seconds
 * - Custom fetcher function for data queries
 */
function Root({ children }: { children: React.ReactNode }) {
  const queryClient = useRef(
    new QueryClient({
      defaultOptions: {
        queries: {
          refetchInterval: 6_000,
          queryFn: ({ queryKey }) => (queryKey[0] ? fetcher(queryKey[0] as string) : null)
        }
      }
    })
  );
  const navigate = useNavigate();

  return (
    <HeroUIProvider navigate={navigate}>
      <StyledEngineProvider injectFirst>
        <ThemeProvider>
          <QueryClientProvider client={queryClient.current}>
            <GlobalStyle />
            {children}
          </QueryClientProvider>
        </ThemeProvider>
      </StyledEngineProvider>
    </HeroUIProvider>
  );
}

export default Root;
