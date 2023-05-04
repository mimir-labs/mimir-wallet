// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { KeyringStore } from '@polkadot/ui-keyring/types';

import { StyledEngineProvider } from '@mui/material';
import { Suspense } from 'react';
import { HashRouter } from 'react-router-dom';

import { appConfig } from '@mimirdev/app-config';
import { ApiCtxRoot } from '@mimirdev/react-api';
import { ThemeProvider } from '@mimirdev/react-components';
import { KeyringCtxRoot, SelectAccountCtxRoot } from '@mimirdev/react-hooks';

import App from './App';

interface Props {
  store?: KeyringStore;
}

function Root({ store }: Props) {
  return (
    <Suspense fallback='...'>
      <StyledEngineProvider injectFirst>
        <ThemeProvider>
          <ApiCtxRoot apiUrl={appConfig.apiUrl} store={store}>
            <KeyringCtxRoot>
              <SelectAccountCtxRoot>
                <HashRouter>
                  <App />
                </HashRouter>
              </SelectAccountCtxRoot>
            </KeyringCtxRoot>
          </ApiCtxRoot>
        </ThemeProvider>
      </StyledEngineProvider>
    </Suspense>
  );
}

export default Root;
