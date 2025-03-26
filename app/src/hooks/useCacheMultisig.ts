// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { CacheMultisig } from './types';

import { service } from '@/utils';

import { addressToHex } from '@mimir-wallet/polkadot-core';
import { useQuery } from '@mimir-wallet/service';

import { useAddressStore } from './useAddressStore';

export function useCacheMultisig(): [data: CacheMultisig[], isLoading: boolean] {
  const { accounts } = useAddressStore();
  const { data, isLoading } = useQuery<CacheMultisig[]>({
    refetchInterval: false,
    queryHash: service.getNetworkUrl(
      `multisig/pending?${accounts.map(({ address }) => `addresses=${addressToHex(address)}`).join('&')}`
    ),
    queryKey: [
      accounts.length > 0
        ? service.getNetworkUrl(
            `multisig/pending?${accounts.map(({ address }) => `addresses=${addressToHex(address)}`).join('&')}`
          )
        : null
    ]
  });

  return [data?.filter((item) => item.who && item.threshold) || [], isLoading];
}
