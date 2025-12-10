// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useLocalStore } from '@mimir-wallet/service';
import { useCallback } from 'react';

import { RECENT_NETWORKS_KEY } from '@/constants';

const MAX_RECENT_NETWORKS = 10;

/**
 * Hook to manage recent networks with localStorage persistence
 *
 * @returns recentNetworks - Array of network keys sorted by recent usage (deduplicated)
 * @returns addRecent - Function to add/move network to front of recent list
 *                      If maxVisible is provided, only moves if not already in top N
 */
export function useRecentNetworks() {
  const [recentNetworks, setRecentNetworks] = useLocalStore<string[]>(
    RECENT_NETWORKS_KEY,
    [],
  );

  const addRecent = useCallback(
    (networkKey: string, maxVisible?: number) => {
      setRecentNetworks((prev) => {
        // Deduplicate first
        const deduplicated = [...new Set(prev)];

        // If maxVisible is provided, check if network is already in top N
        if (maxVisible !== undefined) {
          const currentIndex = deduplicated.indexOf(networkKey);

          // If already in top N visible, don't change order
          if (currentIndex >= 0 && currentIndex < maxVisible) {
            return deduplicated.slice(0, MAX_RECENT_NETWORKS);
          }
        }

        // Move to front
        const filtered = deduplicated.filter((k) => k !== networkKey);

        return [networkKey, ...filtered].slice(0, MAX_RECENT_NETWORKS);
      });
    },
    [setRecentNetworks],
  );

  return { recentNetworks, addRecent };
}
