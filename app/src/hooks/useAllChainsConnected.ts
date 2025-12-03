// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ApiManager } from '@mimir-wallet/polkadot-core';
import { useCallback, useSyncExternalStore } from 'react';

/**
 * Hook to check if all enabled chains are connected and ready
 *
 * @returns boolean - true if all enabled chains are connected and ready
 */
export function useAllChainsConnected(): boolean {
  const subscribe = useCallback((onStoreChange: () => void) => {
    return ApiManager.getInstance().subscribe(() => onStoreChange());
  }, []);

  const getSnapshot = useCallback(() => {
    const manager = ApiManager.getInstance();

    return Object.values(manager.getAllApis()).every((item) => {
      return item.status.isApiConnected && item.status.isApiReady;
    });
  }, []);

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
