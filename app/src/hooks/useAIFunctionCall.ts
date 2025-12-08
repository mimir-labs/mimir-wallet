// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { FunctionCallHandler } from '@mimir-wallet/ai-assistant';

import { NavigationMiddleware } from '@mimir-wallet/ai-assistant';
import { useChains, useSs58Format } from '@mimir-wallet/polkadot-core';
import { useLocation, useNavigate } from '@tanstack/react-router';
import { useCallback, useEffect } from 'react';

import { useFunctionCallHandler } from './useFunctionCallHandler';

// ============================================================================
// Route Check Helper
// ============================================================================

/**
 * Hook to check if current route matches required route and provide navigation capability
 */
function useRouteCheck() {
  const location = useLocation();
  const navigate = useNavigate();

  const checkAndNavigate = useCallback(
    (requiredRoute: string) => {
      const currentPath = location.pathname;

      // Decode the required route for comparison
      const decodedRequiredRoute = decodeURIComponent(requiredRoute);

      // Check if current path includes the required route (supports both encoded and decoded paths)
      const isOnRequiredRoute =
        currentPath.includes(requiredRoute) ||
        currentPath.includes(decodedRequiredRoute) ||
        decodeURIComponent(currentPath).includes(decodedRequiredRoute);

      return {
        isOnRequiredRoute,
        navigateToRoute: async () => {
          await navigate({ to: requiredRoute });
        },
      };
    },
    [location, navigate],
  );

  return checkAndNavigate;
}

// ============================================================================
// Navigation Middleware Initialization
// ============================================================================

/**
 * Initialize navigation middleware for route-dependent function calls
 * Uses metadata registry to determine which functions require routes
 */
function useNavigationMiddleware() {
  const checkAndNavigate = useRouteCheck();

  useEffect(() => {
    const middleware = new NavigationMiddleware(checkAndNavigate);

    return middleware.start();
  }, [checkAndNavigate]);
}

// ============================================================================
// Global Function Call Handlers
// ============================================================================

/**
 * Handler for 'navigate' function calls
 */
function useNavigateCallHandler() {
  const navigate = useNavigate();

  const handler = useCallback<FunctionCallHandler>(
    (event) => {
      const { path, query, params, hash } = event.arguments as {
        path: string;
        query?: Record<string, string>;
        params?: Record<string, string>;
        hash?: string;
      };

      const navParams: {
        to: string;
        params?: Record<string, string>;
        search?: Record<string, string>;
        hash?: string;
      } = {
        to: path,
      };

      if (params) navParams.params = params;
      if (query) navParams.search = query;
      if (hash) navParams.hash = hash.startsWith('#') ? hash.slice(1) : hash;

      navigate(navParams);
    },
    [navigate],
  );

  useFunctionCallHandler('navigate', handler);
}

/**
 * Handler for 'showComponent' with 'switchNetworks' type
 */
function useSwitchNetworksHandler() {
  const { enableNetwork, disableNetwork } = useChains();

  const handler = useCallback<FunctionCallHandler>(
    (event) => {
      if ((event.arguments as any).componentType !== 'switchNetworks') return;

      const networks = ((event.arguments?.props as any)?.networks || []) as {
        networkKey: string;
        isEnabled: boolean;
      }[];

      networks.forEach((item) => {
        if (item.isEnabled) {
          enableNetwork(item.networkKey);
        } else {
          disableNetwork(item.networkKey);
        }
      });
    },
    [enableNetwork, disableNetwork],
  );

  useFunctionCallHandler('showComponent', handler, {
    metadata: { componentType: 'switchNetworks' },
  });
}

/**
 * Handler for 'showComponent' with 'setSs58Chain' type
 */
function useSetSs58ChainHandler() {
  const { setSs58Chain } = useSs58Format();

  const handler = useCallback<FunctionCallHandler>(
    (event) => {
      if ((event.arguments as any).componentType !== 'setSs58Chain') return;

      const networkKey = (event.arguments?.props as any)?.networkKey as string;

      if (networkKey) {
        setSs58Chain(networkKey);
      }
    },
    [setSs58Chain],
  );

  useFunctionCallHandler('showComponent', handler, {
    metadata: { componentType: 'setSs58Chain' },
  });
}

// ============================================================================
// Main Hook
// ============================================================================

/**
 * Main AI function call initialization hook
 * Coordinates navigation middleware and global handlers
 *
 * NO HARDCODED ROUTE DEPENDENCIES - All route requirements are declared
 * via metadata when handlers register themselves
 */
export function useAIFunctionCall() {
  // Initialize navigation middleware (handles ALL route-dependent calls via metadata)
  useNavigationMiddleware();

  // Register global non-route-dependent handlers
  useNavigateCallHandler();
  useSwitchNetworksHandler();
  useSetSs58ChainHandler();
}
