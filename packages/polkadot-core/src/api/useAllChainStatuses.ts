// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ChainStatus } from '../types/types.js';

import { isEqual } from 'lodash-es';
import { useSyncExternalStore } from 'react';

import { ApiManager } from './ApiManager.js';

// Stable subscribe function for ApiManager
function subscribeToApiManager(onStoreChange: () => void): () => void {
  return ApiManager.getInstance().subscribe(() => onStoreChange());
}

// Cache for chain statuses to avoid unnecessary re-renders
let cachedStatuses: Record<string, ChainStatus> = {};

function getChainStatusesSnapshot(): Record<string, ChainStatus> {
  const manager = ApiManager.getInstance();
  const apis = manager.getAllApis();
  const newStatuses: Record<string, ChainStatus> = {};

  for (const [key, connection] of Object.entries(apis)) {
    newStatuses[key] = connection.status;
  }

  // Check if statuses have changed
  const keys = Object.keys(newStatuses);
  const cachedKeys = Object.keys(cachedStatuses);

  if (keys.length === cachedKeys.length && keys.every((key) => isEqual(cachedStatuses[key], newStatuses[key]))) {
    return cachedStatuses;
  }

  cachedStatuses = newStatuses;

  return cachedStatuses;
}

/**
 * Hook to get all chain statuses at once with a single subscription
 *
 * This is more efficient than calling useChainStatus for each chain individually,
 * as it uses a single subscription to ApiManager and returns all statuses at once.
 *
 * @returns Record of chain key to isApiReady status
 *
 * @example
 * ```tsx
 * const statuses = useAllChainStatuses();
 *
 * // Check if a specific chain is ready
 * const isPolkadotReady = statuses['polkadot'] ?? false;
 * ```
 */
export function useAllChainStatuses(): Record<string, ChainStatus> {
  return useSyncExternalStore(subscribeToApiManager, getChainStatusesSnapshot, () => ({}));
}
