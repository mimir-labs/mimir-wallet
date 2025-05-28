// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useApi } from '@mimir-wallet/polkadot-core';
import { useQuery } from '@mimir-wallet/service';

import { useBlockInterval } from './useBlockInterval';

export function useBestBlock() {
  const { api, isApiReady, genesisHash } = useApi();
  const blockInterval = useBlockInterval();
  const {
    data: bestBlock,
    isFetched,
    isFetching
  } = useQuery({
    queryKey: ['bestBlock'] as const,
    queryHash: `${genesisHash}.api.rpc.chain.getHeader()`,
    enabled: isApiReady,
    refetchOnMount: false,
    refetchInterval: blockInterval.toNumber(),
    queryFn: async () => {
      const header = await api.rpc.chain.getHeader();

      return header;
    }
  });

  return [bestBlock, isFetched, isFetching] as const;
}
