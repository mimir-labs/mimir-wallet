// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ApiManager, isPolkadotAddress } from '@mimir-wallet/polkadot-core';
import { useQuery } from '@mimir-wallet/service';

async function fetchProxies({ queryKey }: { queryKey: readonly [string, string, string | null | undefined] }) {
  const [, network, address] = queryKey;

  if (!address) {
    throw new Error('Address is required');
  }

  const api = await ApiManager.getInstance().getApi(network);

  return api.query.proxy.proxies(address);
}

/**
 * Hook to fetch proxy data for an address on a specific network
 * @param network - The network key to query
 * @param address - The address to query proxies for
 */
export function useProxies(network: string, address?: string | null) {
  const { data, isFetched, isFetching } = useQuery({
    queryKey: ['proxies', network, address] as const,
    enabled: !!address && isPolkadotAddress(address) && !!network,
    queryFn: fetchProxies
  });

  return [data, isFetched, isFetching] as const;
}
