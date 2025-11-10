// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { QueryClient } from '@tanstack/react-query';

import { fetcher } from '../fetcher.js';

// Refetch interval constants by data type
export const REFETCH_INTERVALS = {
  BLOCKCHAIN_STATE: 12_000, // Blockchain state (12s)
  TRANSACTION_LIST: 15_000, // Transaction lists (15s)
  PRICE_DATA: 30_000, // Price data (30s)
  STATIC_DATA: false // Static data (no refetch)
} as const;

// Stale time constants by data type
// Determines how long data stays "fresh" before being considered stale
export const STALE_TIMES = {
  REAL_TIME: 0, // Real-time data (immediately stale)
  FREQUENT: 5_000, // Frequently changing data (5s)
  MODERATE: 30_000, // Moderately changing data (30s)
  STATIC: 5 * 60_000 // Static/rarely changing data (5min)
} as const;

// Smart refetch interval that respects window focus
function getSmartRefetchInterval(baseInterval: number | false): number | false {
  if (baseInterval === false) return false;

  // Only refetch when window has focus
  return typeof document !== 'undefined' && !document.hasFocus() ? false : baseInterval;
}

// Create global queryClient instance for use in loaders and components
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Use smart refetch interval that respects window focus
      refetchInterval: (query) => {
        // Default to BLOCKCHAIN_STATE interval if not specified
        const baseInterval = (query.state.data as any)?._refetchInterval ?? REFETCH_INTERVALS.BLOCKCHAIN_STATE;

        return getSmartRefetchInterval(baseInterval);
      },
      // Refetch on window focus
      refetchOnWindowFocus: true,
      // Default stale time for frequently changing data
      // This prevents duplicate requests when using loaders + hooks
      staleTime: STALE_TIMES.FREQUENT,
      // Enable experimental prefetch in render
      experimental_prefetchInRender: true,
      // Default query function using fetcher
      queryFn: ({ queryKey }) => (queryKey[0] ? fetcher(queryKey[0] as string) : null)
    }
  }
});
