// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { FunctionCallHandler, HandlerRegistrationOptions, RouteRequirement } from '@mimir-wallet/ai-assistant';

import { useCallback, useEffect } from 'react';

import { functionCallManager } from '@mimir-wallet/ai-assistant';

/**
 * Hook to register a simple function call handler (no route requirement)
 *
 * @example
 * useFunctionCallHandler('navigate', handler);
 *
 * @example
 * useFunctionCallHandler('showComponent', handler, {
 *   priority: 10,
 *   metadata: { componentType: 'switchNetworks' }
 * });
 */
export function useFunctionCallHandler(
  functionName: string,
  handler: FunctionCallHandler,
  options?: {
    priority?: number;
    metadata?: Record<string, unknown>;
  }
): void {
  // Memoize options to avoid unnecessary re-registrations
  const optionsStr = JSON.stringify(options);

  useEffect(() => {
    const parsedOptions = optionsStr ? JSON.parse(optionsStr) : undefined;

    return functionCallManager.registerHandler(functionName, handler, parsedOptions);
  }, [functionName, handler, optionsStr]);
}

/**
 * Hook to register a route-dependent function call handler
 * Automatically declares route requirement via metadata
 *
 * @example
 * useRouteDependentHandler(
 *   'createMultisig',
 *   '/create-multisig',
 *   handler
 * );
 *
 * @example
 * useRouteDependentHandler(
 *   'createMultisig',
 *   '/create-multisig',
 *   handler,
 *   { displayName: 'Create Multisig', priority: 10 }
 * );
 */
export function useRouteDependentHandler(
  functionName: string,
  routePath: string,
  handler: FunctionCallHandler,
  options?: {
    displayName?: string;
    autoNavigate?: boolean;
    priority?: number;
    navigationOptions?: RouteRequirement['navigationOptions'];
  }
): void {
  // Memoize route requirement
  const routeRequirement = useCallback<() => RouteRequirement>(
    () => ({
      path: routePath,
      displayName: options?.displayName,
      autoNavigate: options?.autoNavigate ?? true,
      navigationOptions: options?.navigationOptions
    }),
    [routePath, options?.displayName, options?.autoNavigate, options?.navigationOptions]
  );

  useEffect(() => {
    const registrationOptions: HandlerRegistrationOptions = {
      requiresRoute: routeRequirement(),
      priority: options?.priority
    };

    return functionCallManager.registerHandler(functionName, handler, registrationOptions);
  }, [functionName, handler, routeRequirement, options?.priority]);
}
