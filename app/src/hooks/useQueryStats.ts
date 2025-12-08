// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { addressToHex, useChains } from '@mimir-wallet/polkadot-core';
import { service, useQuery } from '@mimir-wallet/service';
import { useMemo } from 'react';

export function useMultiChainStats(
  address?: string | null,
): [data: Record<string, boolean>, isFetched: boolean, isFetching: boolean] {
  const addressHex = useMemo(
    () => (address ? addressToHex(address.toString()) : ''),
    [address],
  );
  const { chains } = useChains();

  // Get enabled network keys
  const chainsSet = useMemo(() => new Set(chains.map((c) => c.key)), [chains]);

  const { data, isFetched, isFetching } = useQuery({
    queryKey: ['multi-chain-stats', addressHex] as const,
    enabled: !!addressHex,
    queryFn: ({ queryKey: [, addressHex] }): Promise<Record<string, boolean>> =>
      service.account.getMultiChainStats(addressHex),
  });

  return [
    useMemo(
      () =>
        Object.fromEntries(
          Object.entries(data || {}).filter(
            ([network, enabled]) => chainsSet.has(network) && enabled,
          ),
        ),
      [data, chainsSet],
    ),
    isFetched,
    isFetching,
  ];
}

export function useQueryStats(chain: string, address?: string | null) {
  const addressHex = useMemo(
    () => (address ? addressToHex(address.toString()) : ''),
    [address],
  );

  const { data, isFetched, isFetching } = useQuery({
    queryKey: ['chain-stats', chain, addressHex] as const,
    enabled: !!addressHex,
    queryFn: ({
      queryKey: [, chain, addressHex],
    }): Promise<{
      total: number;
      callOverview: { section: string; method: string; counts: number }[];
      transferBook: { to: string; amount: string }[];
      transactionCounts: { time: string; address: string; counts: number }[];
    }> => service.account.getChainStats(chain, addressHex),
  });

  return [data, isFetched, isFetching] as const;
}
