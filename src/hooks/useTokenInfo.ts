// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useQuery } from '@tanstack/react-query';

import { chainLinks } from '@mimir-wallet/api/chain-links';

import { TokenInfo } from './types';

export function useTokenInfo(): [tokenInfo: Record<string, TokenInfo> | undefined, isLoading: boolean] {
  const { data, isFetching } = useQuery<{ detail: Record<string, TokenInfo>; token: string[] }>({
    queryHash: chainLinks.serviceUrl('scan/token'),
    queryKey: [chainLinks.serviceUrl('scan/token')]
  });

  return [data?.detail, isFetching];
}
