// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import useSWR from 'swr';

import { service } from '@mimirdev/utils';

import { CacheMultisig } from './types';
import { useAccounts } from './useAccounts';

export function useCacheMultisig(): [data: CacheMultisig[], isLoading: boolean] {
  const accounts = useAccounts();
  const { data, isLoading } = useSWR<CacheMultisig[]>(
    service.getServiceUrl(accounts.allAccounts.length > 0 ? `multisig/pending?${accounts.allAccountsHex.map((address) => `addresses=${address}`).join('&')}` : null)
  );

  return [data || [], isLoading];
}
