// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { isPolkadotAddress, useAllApis, useApi } from '@mimir-wallet/polkadot-core';
import { useQuery } from '@mimir-wallet/service';

async function fetchProxies({ queryKey }: { queryKey: readonly [string, string, string | null | undefined] }) {
  const [, network, address] = queryKey;

  if (!address) {
    throw new Error('Address is required');
  }

  const allApis = useAllApis.getState().chains;
  const api = allApis[network]?.api;

  if (!api) {
    throw new Error(`API not available for network: ${network}`);
  }

  return api.query.proxy.proxies(address);
}

export function useProxies(address?: string | null) {
  const { isApiReady, network } = useApi();

  const { data, isFetched, isFetching } = useQuery({
    queryKey: ['proxies', network, address] as const,
    enabled: !!address && isPolkadotAddress(address) && isApiReady,
    queryFn: fetchProxies
  });

  return [data, isFetched, isFetching] as const;
}
