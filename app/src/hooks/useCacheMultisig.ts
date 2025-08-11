// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { CacheMultisig } from './types';

import { useWallet } from '@/wallet/useWallet';
import { isEqual } from 'lodash-es';

import { addressToHex, useApi } from '@mimir-wallet/polkadot-core';
import { service, useQuery } from '@mimir-wallet/service';

export function useCacheMultisig(): [data: CacheMultisig[], isLoading: boolean] {
  const { walletAccounts } = useWallet();
  const { network } = useApi();

  const addresses: string[] = walletAccounts.map(({ address }) => addressToHex(address)).sort();
  const { data, isLoading } = useQuery({
    queryKey: [network, addresses] as const,
    queryHash: `prepare-pure-pending-${network}-${addresses.join(',')}`,
    staleTime: 6_000,
    refetchInterval: 6_000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    enabled: !!network && addresses.length > 0,
    queryFn: ({ queryKey: [chain, address] }): Promise<CacheMultisig[]> =>
      service.multisig.pendingPrepareMultisig(chain, address),
    structuralSharing: (prev, next) => {
      return isEqual(prev, next) ? prev : next;
    }
  });

  return [data?.filter((item) => item.who && item.threshold) || [], isLoading];
}
