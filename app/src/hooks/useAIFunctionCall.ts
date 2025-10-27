// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useCallback, useEffect } from 'react';
import { parsePath, useLocation, useNavigate } from 'react-router-dom';

import { type FunctionCallHandler, functionCallManager } from '@mimir-wallet/ai-assistant';
import { useApi, useNetworks } from '@mimir-wallet/polkadot-core';

// Route dependency configuration for function calls that require specific routes
const ROUTE_DEPENDENT_FUNCTION_CALLS: Record<string, string> = {
  transferForm: '/explorer/mimir%3A%2F%2Fapp%2Ftransfer',
  batchTransferForm: '/explorer/mimir%3A%2F%2Fapp%2Fmulti-transfer',
  createMultisig: '/create-multisig',
  createProxy: '/add-proxy'
} as const;

// Friendly route names for user-facing messages
const ROUTE_FRIENDLY_NAMES: Record<string, string> = {
  '/explorer/mimir%3A%2F%2Fapp%2Ftransfer': 'Transfer',
  '/explorer/mimir%3A%2F%2Fapp%2Fmulti-transfer': 'Multi-Transfer',
  '/create-multisig': 'Create Multisig',
  '/add-proxy': 'Add Proxy'
};

// Helper function to get friendly route name
function getFriendlyRouteName(route: string): string {
  return ROUTE_FRIENDLY_NAMES[route] || route;
}

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
        navigateToRoute: () => navigate(requiredRoute)
      };
    },
    [location, navigate]
  );

  return checkAndNavigate;
}

/**
 * Hook to handle route-dependent function calls via pre-navigation event
 * Automatically navigates to required route if not already there
 *
 * Design: This hook uses the dedicated pre-navigation event that:
 * 1. Is emitted BEFORE the actual functioncall event
 * 2. Only for route-dependent function calls (transferForm, batchTransferForm, createMultisig, createProxy)
 * 3. Allows route navigation without interfering with page component handlers
 * 4. Page components listen to the regular functioncall event and handle it normally
 */
function useRouteDependentFunctionCalls() {
  const checkAndNavigate = useRouteCheck();

  useEffect(() => {
    const handler: FunctionCallHandler = (event) => {
      const { name } = event;

      // Check if this function call requires a specific route
      const requiredRoute = ROUTE_DEPENDENT_FUNCTION_CALLS[name];

      if (!requiredRoute) {
        return; // Not a route-dependent function call, skip (shouldn't happen for pre-navigation events)
      }

      const { isOnRequiredRoute, navigateToRoute } = checkAndNavigate(requiredRoute);

      // If not on required route, navigate
      // The page component will handle the functioncall event after navigation completes
      if (!isOnRequiredRoute) {
        console.log(`[Mimir AI] Auto-navigating to ${getFriendlyRouteName(requiredRoute)} page for ${name} operation`);
        navigateToRoute();
      }

      // If already on correct route, do nothing
      // The functioncall event will be emitted shortly and handled by page components
    };

    // Use onPreNavigation instead of onFunctionCall to only listen to pre-navigation events
    return functionCallManager.onPreNavigation(handler);
  }, [checkAndNavigate]);
}

function useNavigateCall() {
  const navigate = useNavigate();

  useEffect(() => {
    const handler: FunctionCallHandler = (event) => {
      if (event.name === 'navigate') {
        const { path, query, params } = event.arguments as {
          path: string;
          query?: Record<string, string>;
          params?: Record<string, string>;
        };

        let finalPath = path;

        if (params) {
          Object.entries(params).forEach(([key, value]) => {
            finalPath = finalPath.replace(`:${key}`, value);
          });
        }

        const url = parsePath(finalPath);

        if (query) {
          url.search = `?${Object.entries(query)
            .map(([key, value]) => `${key}=${value}`)
            .join('&')}`;
        }

        // Execute navigation for regular routes and mark as AI navigation
        navigate(url);

        return functionCallManager.respondToFunctionCall({
          id: event.id,
          success: true,
          result: {
            message: `Navigation completed. Page state may change, so please confirm any time-sensitive information.`
          }
        });
      }
    };

    return functionCallManager.onFunctionCall(handler);
  }, [navigate]);
}

function useSwitchNetworksCall() {
  const { enableNetwork, disableNetwork } = useNetworks();

  useEffect(() => {
    const handler: FunctionCallHandler = (event) => {
      if (event.name !== 'showComponent' && event.arguments.componentType !== 'switchNetworks') return;
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

      return functionCallManager.respondToFunctionCall({
        id: event.id,
        success: true,
        result: `operate successful`
      });
    };

    return functionCallManager.onFunctionCall(handler);
  });
}

function useSetSs58Chain() {
  const { setSs58Chain } = useApi();

  useEffect(() => {
    const handler: FunctionCallHandler = (event) => {
      if (event.name !== 'showComponent' && event.arguments.componentType !== 'setSs58Chain') return;
      const networkKey = (event.arguments?.props as any)?.networkKey as string;

      if (networkKey) {
        setSs58Chain(networkKey);
      }

      return functionCallManager.respondToFunctionCall({
        id: event.id,
        success: true,
        result: `operate successful`
      });
    };

    return functionCallManager.onFunctionCall(handler);
  });
}

export function useAIFunctionCall() {
  // Route-dependent function calls middleware (runs first to check route requirements)
  useRouteDependentFunctionCalls();

  // Regular function call handlers
  useNavigateCall();
  useSwitchNetworksCall();
  useSetSs58Chain();
}
