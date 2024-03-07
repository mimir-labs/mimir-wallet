// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { cacheNames, clientsClaim, setCacheNameDetails, skipWaiting } from 'workbox-core';
import { ExpirationPlugin } from 'workbox-expiration';
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst, NetworkFirst } from 'workbox-strategies';

import { deleteUnusedCaches, matchCss, matchJs, matchStatic } from './utils';

declare const self: ServiceWorkerGlobalScope & Window & typeof globalThis;

clientsClaim();
skipWaiting();

setCacheNameDetails({
  prefix: 'mimir-wallet',
  precache: 'precache',
  runtime: 'runtime'
});

const precacheEntries = self.__WB_MANIFEST.filter((item) => {
  console.log(item);

  if (typeof item === 'string') {
    return false;
  } else {
    if (item.url.includes('static/media/')) {
      return false;
    } else if (item.revision) {
      return !item.url.endsWith('LICENSE.txt');
    } else {
      return true;
    }
  }
});

// Precaches entries and registers a default route to serve them.
precacheAndRoute(precacheEntries);

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

// We only use the precache and runtime caches, so we delete the rest to avoid taking space.
// Wait to do so until 'activate' in case activation fails.
self.addEventListener('activate', () => deleteUnusedCaches(self.caches, { usedCaches: [cacheNames.precache, 'css-cache', 'js-cache', 'static-cache'] }));
