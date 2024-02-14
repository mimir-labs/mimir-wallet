// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { getServiceUrl } from '@mimir-wallet/utils/service';
import useSWR from 'swr';

import { TokenInfo } from './types';

export function useTokenInfo(): [tokenInfo: Record<string, TokenInfo> | undefined, isLoading: boolean] {
  const { data, isLoading } = useSWR<{ detail: Record<string, TokenInfo>; token: string[] }>(getServiceUrl('scan/token'));

  return [data?.detail, isLoading];
}
