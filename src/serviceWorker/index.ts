// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { cacheNames, clientsClaim, skipWaiting } from 'workbox-core';
import { ExpirationPlugin } from 'workbox-expiration';
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute, Route } from 'workbox-routing';
import { CacheFirst } from 'workbox-strategies';

import { DocumentRoute } from './document';
import { deleteUnusedCaches, groupEntries } from './utils';

declare const self: ServiceWorkerGlobalScope & Window & typeof globalThis;

clientsClaim();

skipWaiting();

// Registers the document route for the precached document.
// This must be done before setting up workbox-precaching, so that it takes precedence.
registerRoute(new DocumentRoute());

const { onDemandEntries, precacheEntries } = groupEntries(self.__WB_MANIFEST);
const onDemandURLs = onDemandEntries.map((entry) => (typeof entry === 'string' ? entry : entry.url));

const onDemandCacheName = `${cacheNames.prefix}-on-demand-${cacheNames.suffix}`;

registerRoute(
  new Route(
    ({ url }) => onDemandURLs.includes('.' + url.pathname),
    new CacheFirst({
      cacheName: onDemandCacheName,
      plugins: [new ExpirationPlugin({ maxEntries: 64 })]
    })
  )
);

precacheAndRoute(precacheEntries); // precache cache

// We only use the precache and runtime caches, so we delete the rest to avoid taking space.
// Wait to do so until 'activate' in case activation fails.
self.addEventListener('activate', () => deleteUnusedCaches(self.caches, { usedCaches: [cacheNames.precache, onDemandCacheName] }));
