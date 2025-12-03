// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { createRouter } from '@tanstack/react-router';

// Import the generated route tree
import { routeTree } from './routeTree.gen';

/**
 * Layout Options Type
 *
 * Defines the layout configuration options that can be set by individual routes
 */
export interface LayoutOptions {
  withPadding?: boolean;
}

/**
 * Router Context Type
 *
 * Defines the shape of the context available to all routes
 */
export interface RouterContext {
  // Layout configuration (set by child routes via beforeLoad)
  layoutOptions?: LayoutOptions;
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
  context: {} as RouterContext,
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
