// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { TokenInfo } from './types';

import { isEqual } from 'lodash-es';

import { service, useClientQuery, useQuery } from '@mimir-wallet/service';

export function useTokenInfo(network: string): [tokenInfo: TokenInfo | undefined, isLoading: boolean] {
  const { queryHash, queryKey } = useClientQuery(`chains/${network}/token`);
  const { data, isFetching } = useQuery<TokenInfo>({
    refetchInterval: 60_000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    queryHash,
    queryKey,
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
    queryKey: [service.getClientUrl(`token/all`)],
    queryHash: service.getClientUrl(`token/all`),
    structuralSharing: (prev, next) => {
      return isEqual(prev, next) ? prev : next;
    }
  });

  return [data, isFetching];
}
