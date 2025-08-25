// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useRef, useState } from 'react';

/**
 * Enhanced ref control hook that handles pending actions before component mount
 *
 * This hook provides a safe way to call methods on components that might not be
 * mounted yet. It queues method calls and executes them once the ref becomes available.
 *
 * Features:
 * - Queues method calls when component is not mounted
 * - Executes queued calls immediately when component becomes available
 * - Comprehensive error handling with recovery mechanisms
 * - Type-safe method calling with full TypeScript support
 *
 * @template T The type of the component/object being referenced
 *
 * @returns Object containing:
 * - `ref`: React ref object to be attached to the target component
 * - `callMethod`: Function to safely call methods on the referenced component
 * - `error`: Current error state (null if no error)
 * - `clearError`: Function to manually clear error state
 *
 * @example
 * ```typescript
 * interface MyComponentRef {
 *   doSomething: (value: string) => void;
 *   reset: () => void;
 * }
 *
 * function ParentComponent() {
 *   const { ref, callMethod, error, clearError } = useRefControl<MyComponentRef>();
 *
 *   const handleAction = () => {
 *     callMethod('doSomething', 'test'); // Safe even if component not mounted
 *   };
 *
 *   if (error) {
 *     return <div>Error: {error.message} <button onClick={clearError}>Retry</button></div>;
 *   }
 *
 *   return <MyComponent ref={ref} onAction={handleAction} />;
 * }
 * ```
 *
 * @since 1.20.1
 */
export function useRefControl<T>() {
  const ref = useRef<T>(null);
  const [pendingActions, setPendingActions] = useState<Array<() => void>>([]);
  const [error, setError] = useState<Error | null>(null);

  // Execute pending actions when ref becomes available
  useEffect(() => {
    if (ref.current && pendingActions.length > 0) {
      try {
        pendingActions.forEach((action) => {
          try {
            action();
          } catch (actionError) {
            console.error('Error executing pending action:', actionError);
            setError(actionError instanceof Error ? actionError : new Error('Unknown action error'));
          }
        });
        setPendingActions([]);
        // Clear error on successful execution
        if (error) setError(null);
      } catch (batchError) {
        console.error('Error executing pending actions batch:', batchError);
        setError(batchError instanceof Error ? batchError : new Error('Unknown batch error'));
      }
    }
  }, [pendingActions, error]);

  const callMethod = <K extends keyof T>(
    method: K,
    ...args: T[K] extends (...args: infer P) => unknown ? P : never
  ) => {
    try {
      if (ref.current) {
        // Component is mounted, call immediately
        const fn = ref.current[method];

        if (typeof fn === 'function') {
          fn(...args);
          // Clear error on successful call
          if (error) setError(null);
        } else {
          throw new Error(`Method '${String(method)}' is not a function`);
        }
      } else {
        // Component not mounted yet, queue the action
        setPendingActions((prev) => [
          ...prev,
          () => {
            const fn = ref.current?.[method];

            if (typeof fn === 'function') {
              fn(...args);
            } else {
              throw new Error(`Method '${String(method)}' is not available`);
            }
          }
        ]);
      }
    } catch (callError) {
      console.error(`Error calling method '${String(method)}':`, callError);
      setError(callError instanceof Error ? callError : new Error(`Error calling ${String(method)}`));
    }
  };

  // Method to clear errors manually
  const clearError = () => setError(null);

  return { ref, callMethod, error, clearError };
}
