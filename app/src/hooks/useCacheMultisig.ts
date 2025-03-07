// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { CacheMultisig } from './types';

import { chainLinks } from '@/api/chain-links';
import { useQuery } from '@tanstack/react-query';

import { useAddressStore } from './useAddressStore';

export function useCacheMultisig(): [data: CacheMultisig[], isLoading: boolean] {
  const { accounts } = useAddressStore();
  const { data, isLoading } = useQuery<CacheMultisig[]>({
    refetchInterval: false,
    queryHash: chainLinks.serviceUrl(`multisig/pending?${accounts.map((address) => `addresses=${address}`).join('&')}`),
    queryKey: [
      accounts.length > 0
        ? chainLinks.serviceUrl(`multisig/pending?${accounts.map((address) => `addresses=${address}`).join('&')}`)
        : null
    ]
  });

  return [data?.filter((item) => item.who && item.threshold) || [], isLoading];
}
