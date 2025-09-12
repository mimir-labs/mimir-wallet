// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { FunctionCallEvent, FunctionCallHandler, FunctionCallResult } from '../types.js';

import { useEffect, useRef } from 'react';

import { functionCallManager } from '../store/functionCallManager.js';

/**
 * Hook for handling function calls from AI
 * @param handlers - Map of function names to their handlers
 * @returns Function to manually trigger a function call
 */
export function useFunctionCall(
  handlers: Record<string, FunctionCallHandler>
): (name: string, args: Record<string, any>) => Promise<FunctionCallResult> {
  const cleanupFns = useRef<Array<() => void>>([]);

  useEffect(() => {
    // Register all handlers
    Object.entries(handlers).forEach(([name, handler]) => {
      const unregister = functionCallManager.register(name, handler);

      cleanupFns.current.push(unregister);
    });

    // Cleanup on unmount
    return () => {
      cleanupFns.current.forEach((fn) => fn());
      cleanupFns.current = [];
    };
  }, [handlers]);

  // Return a function to manually trigger function calls
  const triggerFunctionCall = async (name: string, args: Record<string, any>): Promise<FunctionCallResult> => {
    const event: FunctionCallEvent = {
      id: `fc_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
      name,
      arguments: args,
      timestamp: new Date()
    };

    return functionCallManager.emitFunctionCall(event);
  };

  return triggerFunctionCall;
}

/**
 * Hook for listening to function call events
 * @param callback - Callback to handle function call events
 */
export function useFunctionCallListener(
  callback: (event: FunctionCallEvent) => Promise<FunctionCallResult> | FunctionCallResult
): void {
  useEffect(() => {
    const handler = async (event: FunctionCallEvent, respond: (result: FunctionCallResult) => void) => {
      try {
        const result = await callback(event);

        respond(result);
      } catch (error) {
        respond({
          id: event.id,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    };

    functionCallManager.on('function-call', handler);

    return () => {
      functionCallManager.off('function-call', handler);
    };
  }, [callback]);
}
