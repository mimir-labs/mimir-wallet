// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import moment from 'moment';
import { createRoot } from 'react-dom/client';

import { initializeFavoriteDapps } from './config';
import { initGa } from './initGa';
import Root from './Root';

moment.defaultFormat = 'YYYY-MM-DD HH:mm:ss';

const root = createRoot(document.getElementById('root') as HTMLElement);

initializeFavoriteDapps();
root.render(<Root />);

if (process.env.NODE_ENV === 'production') {
  initGa();
}
