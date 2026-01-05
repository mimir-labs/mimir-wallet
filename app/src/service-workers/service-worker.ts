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

// ============================================================================
// Service Worker Lifecycle
// ============================================================================

skipWaiting();
clientsClaim();

// ============================================================================
// Precache Strategy
// ============================================================================

// Precache critical resources injected by vite-plugin-pwa
// This includes: index.html, index-*.js, index-*.css
precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

// ============================================================================
// Runtime Cache Strategies
// ============================================================================

// ----------------------------------------------------------------------------
// Vendor & Shared Chunks (CacheFirst, 90 days)
// Third-party libraries with content hash, rarely change
// ----------------------------------------------------------------------------

registerRoute(
  ({ url }) =>
    url.origin === self.location.origin &&
    url.pathname.startsWith('/assets/') &&
    (url.pathname.includes('/vendor-') || url.pathname.includes('/shared-')),
  new CacheFirst({
    cacheName: 'vendor-chunks',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 90 * 24 * 60 * 60, // 90 days
        purgeOnQuotaError: true,
      }),
    ],
  }),
);

// ----------------------------------------------------------------------------
// Application Code (StaleWhileRevalidate, 7 days)
// All other JS chunks that may change on deployment
// ----------------------------------------------------------------------------

registerRoute(
  ({ url }) =>
    url.origin === self.location.origin &&
    url.pathname.startsWith('/assets/') &&
    url.pathname.endsWith('.js') &&
    !url.pathname.includes('vendor-') &&
    !url.pathname.includes('shared-'),
  new StaleWhileRevalidate({
    cacheName: 'app-chunks',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({
        maxEntries: 500,
        maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
      }),
    ],
  }),
);

// ----------------------------------------------------------------------------
// CSS Files (StaleWhileRevalidate, 7 days)
// ----------------------------------------------------------------------------

registerRoute(
  ({ url }) =>
    url.origin === self.location.origin &&
    url.pathname.startsWith('/assets/') &&
    url.pathname.endsWith('.css'),
  new StaleWhileRevalidate({
    cacheName: 'styles',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({
        maxEntries: 20,
        maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
      }),
    ],
  }),
);

// Images (30 days) - same-origin only
registerRoute(
  ({ url }) =>
    url.origin === self.location.origin &&
    /\.(?:png|jpe?g|gif|webp|avif|ico|svg)$/.test(url.pathname),
  new CacheFirst({
    cacheName: 'images',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        purgeOnQuotaError: true,
      }),
    ],
  }),
);

// ----------------------------------------------------------------------------
// Static Assets (CacheFirst)
// ----------------------------------------------------------------------------

// Fonts (1 year) - same-origin only
registerRoute(
  ({ url }) =>
    url.origin === self.location.origin &&
    /\.(?:woff2?|ttf|otf|eot)$/.test(url.pathname),
  new CacheFirst({
    cacheName: 'fonts',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({
        maxEntries: 30,
        maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
        purgeOnQuotaError: true,
      }),
    ],
  }),
);

// ============================================================================
// Navigation Fallback for SPA
// ============================================================================

registerRoute(new NavigationRoute(createHandlerBoundToURL('index.html')));

// ============================================================================
// Push Notifications
// ============================================================================

pushSw();
