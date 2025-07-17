// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useMemo } from 'react';

import { addressToHex, useApi } from '@mimir-wallet/polkadot-core';
import { service, useQuery } from '@mimir-wallet/service';

export function useMultiChainStats(
  address?: string | null
): [data: Record<string, boolean>, isFetched: boolean, isFetching: boolean] {
  const addressHex = useMemo(() => (address ? addressToHex(address.toString()) : ''), [address]);
  const { allApis } = useApi();

  const { data, isFetched, isFetching } = useQuery({
    queryKey: [addressHex] as const,
    queryHash: `multi-chain-stats-${addressHex}`,
    enabled: !!addressHex,
    queryFn: ({ queryKey: [addressHex] }): Promise<Record<string, boolean>> =>
      service.account.getMultiChainStats(addressHex)
  });

  return [
    useMemo(
      () => Object.fromEntries(Object.entries(data || {}).filter(([network, enabled]) => allApis[network] && enabled)),
      [data, allApis]
    ),
    isFetched,
    isFetching
  ];
}

export function useQueryStats(chain: string, address?: string | null) {
  const addressHex = useMemo(() => (address ? addressToHex(address.toString()) : ''), [address]);

  const { data, isFetched, isFetching } = useQuery({
    queryKey: [chain, addressHex] as const,
    queryHash: `chain-stats-${chain}-${addressHex}`,
    enabled: !!addressHex,
    queryFn: ({
      queryKey: [chain, addressHex]
    }): Promise<{
      total: number;
      callOverview: { section: string; method: string; counts: number }[];
      transferBook: { to: string; amount: string }[];
      transactionCounts: { time: string; address: string; counts: number }[];
    }> => service.account.getChainStats(chain, addressHex)
  });

  return [data, isFetched, isFetching] as const;
}
