// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { KeyringStore } from '@polkadot/ui-keyring/types';

import { StyledEngineProvider } from '@mui/material';
import { Suspense } from 'react';
import { RouterProvider } from 'react-router-dom';
import { SWRConfig } from 'swr';

import { ApiCtxRoot } from './api';
import { GlobalStyle, ToastRoot } from './components';
import { apiUrl } from './config';
import { BlockEventCtxRoot, KeyringCtxRoot, SelectAccountCtxRoot, TxQueueCtxRoot } from './hooks';
import { routes } from './routes';
import { ThemeProvider } from './theme';
import { fetcher } from './utils';

interface Props {
  store?: KeyringStore;
}

function Root({ store }: Props) {
  return (
    <Suspense fallback='...'>
      <StyledEngineProvider injectFirst>
        <ThemeProvider>
          <SWRConfig value={{ fetcher }}>
            <ApiCtxRoot apiUrl={apiUrl} store={store}>
              <KeyringCtxRoot>
                <SelectAccountCtxRoot>
                  <TxQueueCtxRoot>
                    <BlockEventCtxRoot>
                      <GlobalStyle />
                      <ToastRoot />
                      <RouterProvider router={routes} />
                    </BlockEventCtxRoot>
                  </TxQueueCtxRoot>
                </SelectAccountCtxRoot>
              </KeyringCtxRoot>
            </ApiCtxRoot>
          </SWRConfig>
        </ThemeProvider>
      </StyledEngineProvider>
    </Suspense>
  );
}

export default Root;
