// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { TokenInfo } from './types';

import { isEqual } from 'lodash-es';

import { service, useQuery } from '@mimir-wallet/service';

export function useTokenInfo(network: string): [tokenInfo: TokenInfo | undefined, isLoading: boolean] {
  const { data, isFetching } = useQuery({
    refetchInterval: 60_000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    queryKey: [network] as const,
    queryHash: `token-info-${network}`,
    queryFn: ({ queryKey: [chain] }): Promise<TokenInfo> => service.asset.getTokenInfo(chain),
    structuralSharing: (prev, next) => {
      return isEqual(prev, next) ? prev : next;
    }
  });

  return [data, isFetching];
}

export function useTokenInfoAll(): [tokenInfo: Record<string, TokenInfo> | undefined, isLoading: boolean] {
  const { data, isFetching } = useQuery<Record<string, TokenInfo>>({
    refetchInterval: 60_000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    queryKey: ['token-all'] as const,
    queryHash: 'token-info-all',
    queryFn: (): Promise<Record<string, TokenInfo>> => service.asset.getTokenInfoAll(),
    structuralSharing: (prev, next) => {
      return isEqual(prev, next) ? prev : next;
    }
  });

  return [data, isFetching];
}
