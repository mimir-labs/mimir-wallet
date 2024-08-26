// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import moment from 'moment';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';

import { initializeFavoriteDapps } from './config';
import { initGa } from './initGa';
import { keyringStore } from './instance';
import Root from './Root';

moment.defaultFormat = 'YYYY-MM-DD HH:mm:ss';

const root = createRoot(document.getElementById('root') as HTMLElement);

initializeFavoriteDapps();
root.render(<Root store={keyringStore} />);

if (process.env.NODE_ENV === 'production') {
  registerSW();
  initGa();
}
