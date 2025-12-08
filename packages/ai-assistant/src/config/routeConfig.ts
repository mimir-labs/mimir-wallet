// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { RouteRequirement } from '../types/metadata.js';

/**
 * Static route configuration for function calls
 * This allows route requirements to be known before components mount
 */
export const FUNCTION_ROUTE_CONFIG: Record<string, RouteRequirement> = {
  createMultisig: {
    path: '/create-multisig',
    displayName: 'Create Multisig',
    autoNavigate: true,
  },
  createProxy: {
    path: '/add-proxy',
    displayName: 'Add Proxy',
    autoNavigate: true,
  },
  transferForm: {
    path: '/explorer/mimir%3A%2F%2Fapp%2Ftransfer',
    displayName: 'Transfer',
    autoNavigate: true,
  },
  batchTransferForm: {
    path: '/explorer/mimir%3A%2F%2Fapp%2Fmulti-transfer',
    displayName: 'Multi Transfer',
    autoNavigate: true,
  },
};

/**
 * Get static route requirement for a function
 */
export function getStaticRouteRequirement(
  functionName: string,
): RouteRequirement | undefined {
  return FUNCTION_ROUTE_CONFIG[functionName];
}

/**
 * Check if a function requires a route (static check)
 */
export function requiresRoute(functionName: string): boolean {
  return functionName in FUNCTION_ROUTE_CONFIG;
}
