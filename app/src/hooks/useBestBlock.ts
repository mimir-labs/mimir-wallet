// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useAllApis, useApi } from '@mimir-wallet/polkadot-core';
import { useQuery } from '@mimir-wallet/service';

import { useBlockInterval } from './useBlockInterval';

async function fetchBestBlock({ queryKey }: { queryKey: readonly [string, string] }) {
  const [, network] = queryKey;
  const allApis = useAllApis.getState().chains;
  const api = allApis[network];

  if (!api?.api || !api.isApiReady) {
    throw new Error(`API not ready for network: ${network}`);
  }

  const header = await api.api.rpc.chain.getHeader();

  return header;
}

export function useBestBlock() {
  const { network, isApiReady } = useApi();
  const blockInterval = useBlockInterval();

  const {
    data: bestBlock,
    isFetched,
    isFetching
  } = useQuery({
    queryKey: ['bestBlock', network] as const,
    enabled: !!isApiReady,
    refetchOnMount: false,
    refetchInterval: blockInterval.toNumber(),
    queryFn: fetchBestBlock
  });

  return [bestBlock, isFetched, isFetching] as const;
}
