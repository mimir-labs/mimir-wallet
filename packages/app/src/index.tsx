// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import '@polkadot/api-augment/substrate';

import { createRoot } from 'react-dom/client';

import { appConfig } from '@mimirdev/app-config';

import Root from './Root';

const rootId = 'root';
const rootElement = document.getElementById(rootId);

if (!rootElement) {
  throw new Error(`Unable to find element with id '${rootId}'`);
}

const root = createRoot(rootElement);

appConfig.loadAll();

root.render(<Root />);
