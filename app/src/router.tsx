// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { createRouter } from '@tanstack/react-router';

// Import the generated route tree
import { routeTree } from './routeTree.gen';

/**
 * Router Context Type
 *
 * Defines the shape of the context available to all routes
 */
export interface RouterContext {
  // Authentication state
  current: string | null | undefined;

  // Initialization state
  isApiReady: boolean;
  isWalletReady: boolean;
  isMultisigSyned: boolean;
}

/**
 * Create the router instance
 *
 * The router is configured with:
 * - Generated route tree from file-based routing
 * - Context for authentication and initialization state
 * - Global search parameters (address, network) managed by hooks
 */
export const router = createRouter({
  routeTree,
  context: {
    current: undefined,
    isApiReady: false,
    isWalletReady: false,
    isMultisigSyned: false
  } as RouterContext,
  defaultPreload: 'intent',
  defaultPreloadDelay: 100
});

/**
 * Register router types for TypeScript
 *
 * This provides full type safety for navigation and route parameters
 */
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
