// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { TokenInfo } from './types';

import { chainLinks } from '@/api/chain-links';
import { useQuery } from '@tanstack/react-query';

export function useTokenInfo(): [tokenInfo: Record<string, TokenInfo> | undefined, isLoading: boolean] {
  const { data, isFetching } = useQuery<{ detail: Record<string, TokenInfo>; token: string[] }>({
    queryHash: chainLinks.serviceUrl('scan/token'),
    queryKey: [chainLinks.serviceUrl('scan/token')]
  });

  return [data?.detail, isFetching];
}
