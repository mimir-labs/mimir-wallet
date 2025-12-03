// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ChainStatus } from '../types/types.js';

import { useShallow } from 'zustand/shallow';

import { useApiStore } from './useApiStore.js';

/**
 * Hook to get all chain statuses at once with a single subscription
 *
 * This is more efficient than calling useChainStatus for each chain individually,
 * as it uses a single subscription to the Zustand store and returns all statuses at once.
 *
 * @returns Record of chain key to ChainStatus
 *
 * @example
 * ```tsx
 * const statuses = useAllChainStatuses();
 *
 * // Check if a specific chain is ready
 * const isPolkadotReady = statuses['polkadot']?.isApiReady ?? false;
 * ```
 */
export function useAllChainStatuses(): Record<string, ChainStatus> {
  return useApiStore(useShallow((state) => state.chainStatuses));
}
