// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { FunctionCallEvent, FunctionCallHandler } from '../types.js';

import { getStaticRouteRequirement } from '../config/routeConfig.js';
import { functionCallManager } from '../store/functionCallManager.js';
import { handlerMetadataRegistry } from '../store/handlerMetadataRegistry.js';

/**
 * Navigation middleware that handles route-dependent function calls
 * Queries metadata registry to determine route requirements
 *
 * This middleware:
 * 1. Listens to pre-navigation events from FunctionCallManager
 * 2. Queries HandlerMetadataRegistry for route requirements
 * 3. Performs navigation if needed
 * 4. Signals FunctionCallManager to proceed with event emission
 */
export class NavigationMiddleware {
  private checkAndNavigate: (path: string) => {
    isOnRequiredRoute: boolean;
    navigateToRoute: () => Promise<void>;
  };

  private cleanupFn?: () => void;

  constructor(
    checkAndNavigate: (path: string) => {
      isOnRequiredRoute: boolean;
      navigateToRoute: () => Promise<void>;
    }
  ) {
    this.checkAndNavigate = checkAndNavigate;
  }

  /**
   * Start listening to pre-navigation events
   */
  public start(): () => void {
    const handler: FunctionCallHandler = async (event: FunctionCallEvent) => {
      // Query route requirement: prioritize static config, fallback to metadata registry
      const staticRoute = getStaticRouteRequirement(event.name);
      const metadataRoute = handlerMetadataRegistry.getRouteRequirement(event.name);
      const routeRequirement = staticRoute || metadataRoute;

      if (!routeRequirement) {
        // No route requirement, proceed directly
        functionCallManager.emitAfterNavigation(event);

        return;
      }

      const { isOnRequiredRoute, navigateToRoute } = this.checkAndNavigate(routeRequirement.path);

      if (!isOnRequiredRoute && routeRequirement.autoNavigate) {
        await navigateToRoute();
      }

      // Navigation complete, signal FunctionCallManager to emit the event
      functionCallManager.emitAfterNavigation(event);
    };

    this.cleanupFn = functionCallManager.onPreNavigation(handler);

    return () => this.stop();
  }

  /**
   * Stop listening to pre-navigation events
   */
  public stop(): void {
    this.cleanupFn?.();
    this.cleanupFn = undefined;
  }
}
