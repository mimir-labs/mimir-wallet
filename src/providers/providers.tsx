// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Endpoint } from '@mimir-wallet/config';

import { StyledEngineProvider } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRef } from 'react';

import { ApiCtxRoot } from '@mimir-wallet/api';
import { GlobalStyle, ToastRoot, TxToast } from '@mimir-wallet/components';
import { AddressCtxRoot, TxQueueCtxRoot, TxToastCtxRoot, WalletCtxRoot } from '@mimir-wallet/providers';
import { ThemeProvider } from '@mimir-wallet/theme';
import { fetcher } from '@mimir-wallet/utils';

function Providers({ address, chain, children }: { address?: string; chain: Endpoint; children: React.ReactNode }) {
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

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider>
        <ToastRoot />
        <QueryClientProvider client={queryClient.current}>
          <ApiCtxRoot chain={chain}>
            <WalletCtxRoot>
              <AddressCtxRoot chain={chain} address={address}>
                <TxQueueCtxRoot>
                  <TxToastCtxRoot>
                    <TxToast />
                    <GlobalStyle />
                    {children}
                  </TxToastCtxRoot>
                </TxQueueCtxRoot>
              </AddressCtxRoot>
            </WalletCtxRoot>
          </ApiCtxRoot>
        </QueryClientProvider>
      </ThemeProvider>
    </StyledEngineProvider>
  );
}

export default Providers;
