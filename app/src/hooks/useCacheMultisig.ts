// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { CacheMultisig } from './types';

import { useApi } from '@mimir-wallet/polkadot-core';
import { useClientQuery, useQuery } from '@mimir-wallet/service';

import { useAddressStore } from './useAddressStore';

export function useCacheMultisig(): [data: CacheMultisig[], isLoading: boolean] {
  const { accounts } = useAddressStore();
  const { network } = useApi();
  const { queryHash, queryKey } = useClientQuery(
    `chains/${network}/prepare-pure/pending?addresses=${accounts.map(({ address }) => address).join(',')}`
  );
  const { data, isLoading } = useQuery<CacheMultisig[]>({
    refetchInterval: false,
    queryHash,
    queryKey
  });

  return [data?.filter((item) => item.who && item.threshold) || [], isLoading];
}
