// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { GlobalStyle } from '@/components';
import { ThemeProvider } from '@/theme';
import { StyledEngineProvider } from '@mui/material';
import { useNavigate } from 'react-router-dom';

import { QueryProvider } from '@mimir-wallet/service';
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
  const navigate = useNavigate();

  return (
    <HeroUIProvider navigate={navigate}>
      <StyledEngineProvider injectFirst>
        <ThemeProvider>
          <QueryProvider>
            <GlobalStyle />
            {children}
          </QueryProvider>
        </ThemeProvider>
      </StyledEngineProvider>
    </HeroUIProvider>
  );
}

export default Root;
