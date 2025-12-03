// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useApiStore } from './useApiStore.js';

/**
 * Hook to check if all enabled chains are connected and ready
 *
 * @returns boolean - true if all chains are connected and ready
 *
 * @example
 * ```tsx
 * const allConnected = useAllChainsConnected();
 *
 * if (!allConnected) {
 *   return <Loading message="Connecting to networks..." />;
 * }
 * ```
 */
export function useAllChainsConnected(): boolean {
  return useApiStore((state) => {
    const statuses = Object.values(state.chainStatuses);

    if (statuses.length === 0) return false;

    return statuses.every((s) => s.isApiConnected && s.isApiReady);
  });
}
