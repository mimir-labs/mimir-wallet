// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ChainStatus } from '../types/types.js';

import { useCallback, useSyncExternalStore } from 'react';

import { ApiManager } from './ApiManager.js';

// Stable subscribe function at module level to avoid infinite re-subscription loops
// useSyncExternalStore requires a stable reference for the subscribe function
function subscribeToManager(onStoreChange: () => void): () => void {
  return ApiManager.getInstance().subscribe(() => onStoreChange());
}

// Cache for ChainStatus to avoid unnecessary re-renders
// Key: chain identifier, Value: cached status object
const statusCache = new Map<string, ChainStatus>();

// Default status for uninitialized chains (stable reference)
const DEFAULT_STATUS: ChainStatus = {
  isApiConnected: false,
  isApiReady: false,
  isApiInitialized: false,
  apiError: null
};

/**
 * Get cached status with shallow comparison
 * Returns the same reference if status hasn't changed to prevent unnecessary re-renders
 */
function getCachedStatus(chain: string): ChainStatus {
  const manager = ApiManager.getInstance();
  const newStatus = manager.getStatus(chain);

  // Use default status for uninitialized chains
  if (
    !newStatus.isApiInitialized &&
    !newStatus.isApiReady &&
    !newStatus.isApiConnected &&
    newStatus.apiError === null
  ) {
    return DEFAULT_STATUS;
  }

  const cached = statusCache.get(chain);

  // Return cached if content is the same (shallow compare)
  if (
    cached &&
    cached.isApiConnected === newStatus.isApiConnected &&
    cached.isApiReady === newStatus.isApiReady &&
    cached.isApiInitialized === newStatus.isApiInitialized &&
    cached.apiError === newStatus.apiError
  ) {
    return cached;
  }

  // Update cache with new status
  statusCache.set(chain, newStatus);

  return newStatus;
}

/**
 * Hook to get chain connection status from ApiManager
 *
 * @param chain - Network key (e.g., 'polkadot') or genesis hash
 * @returns ChainStatus object with connection state
 *
 * @example
 * ```tsx
 * const { isApiReady, isApiInitialized, apiError } = useChainStatus('polkadot');
 *
 * if (!isApiInitialized) return <Loading />;
 * if (apiError) return <Error message={apiError} />;
 * if (!isApiReady) return <Connecting />;
 *
 * return <Connected />;
 * ```
 */
export function useChainStatus(chain: string): ChainStatus {
  const getSnapshot = useCallback(() => getCachedStatus(chain), [chain]);

  return useSyncExternalStore(subscribeToManager, getSnapshot, getSnapshot);
}
