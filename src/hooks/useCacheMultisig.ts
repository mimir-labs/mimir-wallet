// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useQuery } from '@tanstack/react-query';

import { serviceUrl } from '@mimir-wallet/utils/chain-links';

import { CacheMultisig } from './types';
import { useAccount } from './useAccounts';

export function useCacheMultisig(): [data: CacheMultisig[], isLoading: boolean] {
  const { accounts } = useAccount();
  const { data, isLoading } = useQuery<CacheMultisig[]>({
    refetchInterval: false,
    queryHash: serviceUrl(`multisig/pending?${accounts.map((address) => `addresses=${address}`).join('&')}`),
    queryKey: [
      accounts.length > 0
        ? serviceUrl(`multisig/pending?${accounts.map((address) => `addresses=${address}`).join('&')}`)
        : null
    ]
  });

  return [data?.filter((item) => item.who && item.threshold) || [], isLoading];
}
