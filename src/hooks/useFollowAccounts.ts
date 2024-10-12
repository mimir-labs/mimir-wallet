// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { isAddress } from '@polkadot/util-crypto';
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

import { encodeAddress } from '@mimir-wallet/api';
import { CURRENT_ADDRESS_PREFIX, CURRENT_NETWORK_KEY } from '@mimir-wallet/constants';
import { store } from '@mimir-wallet/utils';

import { useAccount } from './useAccounts';
import { useApi } from './useApi';

export function useFollowAccounts() {
  const { network } = useApi();
  const { current } = useAccount();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const newSearchParams = new URLSearchParams(searchParams);

    if (network) {
      newSearchParams.set('network', network);
      store.set(CURRENT_NETWORK_KEY, network);
    }

    if (current) {
      newSearchParams.set('address', encodeAddress(current));
      store.set(`${CURRENT_ADDRESS_PREFIX}${network}`, current);
    } else {
      const stored = store.get(`${CURRENT_ADDRESS_PREFIX}${network}`) as string;

      if (stored && isAddress(stored)) {
        newSearchParams.set('address', encodeAddress(stored));
      }
    }

    setSearchParams(newSearchParams, { replace: true });
  }, [current, network, searchParams, setSearchParams]);
}
