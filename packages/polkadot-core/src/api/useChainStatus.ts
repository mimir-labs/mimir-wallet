// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ChainStatus } from '../types/types.js';

import { useShallow } from 'zustand/shallow';

import { useApiStore } from './useApiStore.js';

// Default status for uninitialized chains (stable reference)
const DEFAULT_STATUS: ChainStatus = {
  isApiConnected: false,
  isApiReady: false,
  isApiInitialized: false,
  apiError: null,
};

/**
 * Hook to get chain connection status from ApiManager
 * Uses Zustand selector for efficient single-chain subscription
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
  return useApiStore(
    useShallow((state) => state.chainStatuses[chain] ?? DEFAULT_STATUS),
  );
}
