// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ChainStatus } from '@mimir-wallet/polkadot-core';

import { ApiManager, useChains } from '@mimir-wallet/polkadot-core';
import { useCallback, useSyncExternalStore } from 'react';

/**
 * Hook to check if all enabled chains are connected and ready
 *
 * @returns boolean - true if all enabled chains are connected and ready
 */
export function useAllChainsConnected(): boolean {
  const { chains } = useChains();

  const subscribe = useCallback((onStoreChange: () => void) => {
    return ApiManager.getInstance().subscribe(() => onStoreChange());
  }, []);

  const getSnapshot = useCallback(() => {
    const manager = ApiManager.getInstance();

    return chains.every((chain) => {
      const status: ChainStatus = manager.getStatus(chain.key);

      // Skip chains that haven't been initialized yet
      if (!status.isApiInitialized) {
        return true;
      }

      return status.isApiConnected && status.isApiReady;
    });
  }, [chains]);

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
