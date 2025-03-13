// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { TokenInfo } from './types';

import { service } from '@/utils';

import { useQuery } from '@mimir-wallet/service';

export function useTokenInfo(): [tokenInfo: Record<string, TokenInfo> | undefined, isLoading: boolean] {
  const { data, isFetching } = useQuery<{ detail: Record<string, TokenInfo>; token: string[] }>({
    queryHash: service.getNetworkUrl('scan/token'),
    queryKey: [service.getNetworkUrl('scan/token')]
  });

  return [data?.detail, isFetching];
}
