// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { clientsClaim, setCacheNameDetails, skipWaiting } from 'workbox-core';
import { ExpirationPlugin } from 'workbox-expiration';
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst, NetworkFirst } from 'workbox-strategies';

import { matchCss, matchJs, matchStatic } from './utils';

declare const self: ServiceWorkerGlobalScope;
clientsClaim();
skipWaiting();

setCacheNameDetails({
  prefix: 'mimir-wallet',
  precache: 'precache',
  runtime: 'runtime'
});

// Precaches entries and registers a default route to serve them.
precacheAndRoute(self.__WB_MANIFEST);

// Registers the css' routes for on-demand caching.
registerRoute(
  matchCss,
  new CacheFirst({
    cacheName: 'css-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 10,
        maxAgeSeconds: 30 * 24 * 60 * 60
      })
    ]
  })
);

// Registers the js' routes for on-demand caching.
registerRoute(
  matchJs,
  new NetworkFirst({
    cacheName: 'js-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 10,
        maxAgeSeconds: 30 * 24 * 60 * 60
      })
    ]
  })
);

// Registers the static' routes for on-demand caching.
registerRoute(
  matchStatic,
  new CacheFirst({
    cacheName: 'static-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 30,
        maxAgeSeconds: 30 * 24 * 60 * 60
      })
    ]
  })
);
