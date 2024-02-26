// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import moment from 'moment';
import { createRoot } from 'react-dom/client';

import { initializeFavoriteDapps } from './config';
import { events } from './events';
import { initGa } from './initGa';
import { store } from './instance';
import Root from './Root';
import { register } from './serviceWorkerRegistration';

moment.defaultFormat = 'YYYY-MM-DD HH:mm:ss';

const root = createRoot(document.getElementById('root') as HTMLElement);

initializeFavoriteDapps();
root.render(<Root store={store} />);

if (process.env.NODE_ENV === 'production') {
  initGa();
  register({
    onSuccess: () => events.emit('app_installed'),
    onUpdate: () => events.emit('app_updated')
  });
}
