// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { isAddress } from '@polkadot/util-crypto';

import { addressToHex, useApi } from '@mimir-wallet/polkadot-core';
import { useQuery } from '@mimir-wallet/service';

export function useProxies(address?: string | null) {
  const { api, isApiReady, network } = useApi();

  const { data, isFetched, isFetching } = useQuery({
    queryHash: `${network}-${address ? addressToHex(address) : '0x'}-proxies`,
    queryKey: [address],
    enabled: !!address && isAddress(address) && isApiReady,
    queryFn: ({ queryKey: [address] }: { queryKey: [string | null | undefined] }) => {
      if (!address) {
        throw new Error('Address is required');
      }

      return api.query.proxy.proxies(address);
    }
  });

  return [data, isFetched, isFetching] as const;
}
