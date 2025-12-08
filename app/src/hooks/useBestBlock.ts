// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Header } from '@polkadot/types/interfaces';

import { ApiManager } from '@mimir-wallet/polkadot-core';
import { useQuery } from '@mimir-wallet/service';

import { useBlockInterval } from './useBlockInterval';

async function fetchBestBlock({
  queryKey,
}: {
  queryKey: readonly [string, string];
}): Promise<Header> {
  const [, network] = queryKey;

  const api = await ApiManager.getInstance().getApi(network);

  return api.rpc.chain.getHeader();
}

/**
 * Hook to fetch the best block for a specific network
 * @param network - The network key to query
 * @returns A tuple containing [bestBlock, isFetched, isFetching]
 */
export function useBestBlock(network: string) {
  const blockInterval = useBlockInterval(network);

  const {
    data: bestBlock,
    isFetched,
    isFetching,
  } = useQuery({
    queryKey: ['bestBlock', network] as const,
    enabled: !!network,
    refetchOnMount: false,
    refetchInterval: blockInterval.toNumber(),
    queryFn: fetchBestBlock,
  });

  return [bestBlock, isFetched, isFetching] as const;
}
