// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Registry } from '@polkadot/types/types';

import { ApiManager } from '@mimir-wallet/polkadot-core';
import { useQuery } from '@mimir-wallet/service';

export interface UseRegistryResult {
  registry: Registry | null;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Fetch registry from API
 */
async function fetchRegistry({ queryKey }: { queryKey: readonly [string, string] }): Promise<Registry | null> {
  const [, network] = queryKey;

  const api = await ApiManager.getInstance().getApi(network);

  if (!api) {
    return null;
  }

  return api.registry;
}

/**
 * Hook to get chain registry asynchronously
 *
 * @param network - The network to get registry for
 * @returns Object containing registry, loading state, and error
 *
 * @example
 * ```tsx
 * const { registry, isLoading } = useRegistry('polkadot');
 *
 * if (isLoading || !registry) return <Spinner />;
 *
 * const call = registry.createType('Call', callData);
 * ```
 */
export function useRegistry(network: string): UseRegistryResult {
  const { data, isLoading, error } = useQuery({
    queryKey: ['registry', network] as const,
    queryFn: fetchRegistry,
    enabled: !!network,
    staleTime: Infinity, // Registry doesn't change
    retry: false
  });

  return {
    registry: data ?? null,
    isLoading,
    error: error as Error | null
  };
}
