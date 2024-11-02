// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import moment from 'moment';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';

import App from './App';
import { initializeFavoriteDapps, initMimir } from './config';
import { initGa } from './initGa';

moment.defaultFormat = 'YYYY-MM-DD HH:mm:ss';

const root = createRoot(document.getElementById('root') as HTMLElement);

const { chain, address } = initMimir();

initializeFavoriteDapps();
root.render(<App address={address} chain={chain} />);

if (process.env.NODE_ENV === 'production') {
  registerSW();
  initGa();
}
