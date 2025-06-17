// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useMemo } from 'react';

import { addressToHex, useApi } from '@mimir-wallet/polkadot-core';
import { useClientQuery, useQuery } from '@mimir-wallet/service';

export function useMultiChainStats(
  address?: string | null
): [data: Record<string, boolean>, isFetched: boolean, isFetching: boolean] {
  const addressHex = useMemo(() => (address ? addressToHex(address.toString()) : ''), [address]);
  const { queryHash, queryKey } = useClientQuery(addressHex ? `stats/${addressHex}` : null);
  const { allApis } = useApi();

  const { data, isFetched, isFetching } = useQuery<Record<string, boolean>>({
    queryHash,
    queryKey
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
  const { queryHash, queryKey } = useClientQuery(addressHex ? `chains/${chain}/${addressHex}/stats` : null);

  const { data, isFetched, isFetching } = useQuery<{
    total: number;
    callOverview: { section: string; method: string; counts: number }[];
    transferBook: { to: string; amount: string }[];
    transactionCounts: { time: string; address: string; counts: number }[];
  }>({
    queryHash,
    queryKey
  });

  return [data, isFetched, isFetching] as const;
}
