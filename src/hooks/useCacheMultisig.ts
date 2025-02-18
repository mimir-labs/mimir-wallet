// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useQuery } from '@tanstack/react-query';

import { chainLinks } from '@mimir-wallet/api/chain-links';
import { useApi } from '@mimir-wallet/hooks/useApi';

import { CacheMultisig } from './types';
import { useAddressStore } from './useAddressStore';

export function useCacheMultisig(): [data: CacheMultisig[], isLoading: boolean] {
  const { chain } = useApi();
  const { accounts } = useAddressStore();
  const { data, isLoading } = useQuery<CacheMultisig[]>({
    refetchInterval: false,
    queryHash: chainLinks.serviceUrl(
      chain,
      `multisig/pending?${accounts.map((address) => `addresses=${address}`).join('&')}`
    ),
    queryKey: [
      accounts.length > 0
        ? chainLinks.serviceUrl(
            chain,
            `multisig/pending?${accounts.map((address) => `addresses=${address}`).join('&')}`
          )
        : null
    ]
  });

  return [data?.filter((item) => item.who && item.threshold) || [], isLoading];
}
