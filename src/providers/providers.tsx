// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Endpoint } from '@mimir-wallet/config';

import { StyledEngineProvider } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRef } from 'react';

import { ApiCtxRoot } from '@mimir-wallet/api';
import { GlobalStyle, ToastRoot, TxToast } from '@mimir-wallet/components';
import {
  AddressCtxRoot,
  BlockEventCtxRoot,
  TxQueueCtxRoot,
  TxToastCtxRoot,
  WalletCtxRoot
} from '@mimir-wallet/providers';
import { SocketCtxRoot } from '@mimir-wallet/socket';
import { ThemeProvider } from '@mimir-wallet/theme';
import { fetcher } from '@mimir-wallet/utils';

function Providers({ chain, address, children }: { chain: Endpoint; address?: string; children: React.ReactNode }) {
  const queryClient = useRef(
    new QueryClient({
      defaultOptions: {
        queries: {
          refetchInterval: 6_000,
          queryFn: ({ queryKey }) => (queryKey[0] ? fetcher(queryKey[0] as string) : undefined)
        }
      }
    })
  );

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider>
        <ToastRoot />
        <QueryClientProvider client={queryClient.current}>
          <WalletCtxRoot>
            <ApiCtxRoot chain={chain}>
              <SocketCtxRoot>
                <AddressCtxRoot address={address}>
                  <TxQueueCtxRoot>
                    <BlockEventCtxRoot>
                      <TxToastCtxRoot>
                        <TxToast />
                        <GlobalStyle />
                        {children}
                      </TxToastCtxRoot>
                    </BlockEventCtxRoot>
                  </TxQueueCtxRoot>
                </AddressCtxRoot>
              </SocketCtxRoot>
            </ApiCtxRoot>
          </WalletCtxRoot>
        </QueryClientProvider>
      </ThemeProvider>
    </StyledEngineProvider>
  );
}

export default Providers;
