// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { clientsClaim, skipWaiting } from 'workbox-core';
import { ExpirationPlugin } from 'workbox-expiration';
import {
  cleanupOutdatedCaches,
  createHandlerBoundToURL,
  precacheAndRoute,
} from 'workbox-precaching';
import { NavigationRoute, registerRoute } from 'workbox-routing';
import { CacheFirst, StaleWhileRevalidate } from 'workbox-strategies';

import { pushSw } from './push';

declare const self: ServiceWorkerGlobalScope;

skipWaiting();
clientsClaim();

// Precache only core files (index.html, main entry JS/CSS)
precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

// Runtime caching: Vendor chunks (versioned with hash, long-term cache)
registerRoute(
  /\/assets\/vendor-.*\.js$/,
  new CacheFirst({
    cacheName: 'vendor-chunks',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        purgeOnQuotaError: true,
      }),
    ],
  }),
);

// Runtime caching: App code chunks
registerRoute(
  /\/assets\/.*\.js$/,
  new StaleWhileRevalidate({
    cacheName: 'app-chunks',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
      }),
    ],
  }),
);

// Runtime caching: CSS files
registerRoute(
  /\/assets\/.*\.css$/,
  new StaleWhileRevalidate({
    cacheName: 'styles',
    plugins: [new CacheableResponsePlugin({ statuses: [0, 200] })],
  }),
);

// Runtime caching: Images
registerRoute(
  /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/,
  new CacheFirst({
    cacheName: 'images',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
      }),
    ],
  }),
);

// Runtime caching: Fonts
registerRoute(
  /\.(?:woff|woff2|ttf|otf|eot)$/,
  new CacheFirst({
    cacheName: 'fonts',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({
        maxEntries: 20,
        maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
      }),
    ],
  }),
);

// Navigation fallback
registerRoute(new NavigationRoute(createHandlerBoundToURL('index.html')));

// Initialize push notification handlers
pushSw();
