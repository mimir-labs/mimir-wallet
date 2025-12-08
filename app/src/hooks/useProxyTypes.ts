// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { KitchensinkRuntimeProxyType } from '@polkadot/types/lookup';
import type { Registry } from '@polkadot/types/types';

import { ApiManager } from '@mimir-wallet/polkadot-core';
import { useQuery } from '@mimir-wallet/service';

export function getProxyTypeInstance(
  registry: Registry,
  index = 0,
): KitchensinkRuntimeProxyType {
  // This is not perfect, but should work for `{Kusama, Node, Polkadot}RuntimeProxyType`
  const proxyNames = registry.lookup.names.filter((name) =>
    name.endsWith('RuntimeProxyType'),
  );

  // fallback to previous version (may be Substrate default), when not found
  return registry.createType<KitchensinkRuntimeProxyType>(
    proxyNames.length ? proxyNames[0] : 'ProxyType',
    index,
  );
}

export function getProxyOptions(
  registry: Registry,
): { text: string; value: number }[] {
  return (
    getProxyTypeInstance(registry)
      .defKeys.map((text, value) => ({ text, value }))
      // Filter the empty entries added in v14
      .filter(({ text }) => !text.startsWith('__Unused'))
  );
}

async function fetchProxyTypes({
  queryKey,
}: {
  queryKey: readonly [string, string];
}): Promise<{ text: string; value: number }[]> {
  const [, network] = queryKey;

  const api = await ApiManager.getInstance().getApi(network);

  return getProxyOptions(api.registry);
}

/**
 * Hook to get proxy type options for a specific network
 * @param network - The network key to query
 * @returns Array of proxy type options
 */
export function useProxyTypes(
  network: string,
): { text: string; value: number }[] {
  const { data } = useQuery({
    queryKey: ['proxy-types', network] as const,
    queryFn: fetchProxyTypes,
    enabled: !!network,
    staleTime: Infinity, // Proxy types don't change
  });

  return data ?? [];
}
