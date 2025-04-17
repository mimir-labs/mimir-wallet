// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';

import { CURRENT_NETWORK_KEY, encodeAddress, useApi } from '@mimir-wallet/polkadot-core';
import { store } from '@mimir-wallet/service';

import { useAddressStore } from './useAddressStore';

export function useFollowAccounts() {
  const { network, chainSS58 } = useApi();
  const { current } = useAddressStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentRef = useRef<string | undefined>(current);

  currentRef.current = current;

  const urlCurrent = searchParams.get('address');

  useEffect(() => {
    if (network) {
      const newSearchParams = new URLSearchParams(searchParams);

      newSearchParams.set('network', network);

      setSearchParams(newSearchParams, { replace: true });
    }

    store.set(CURRENT_NETWORK_KEY, network);
  }, [network, searchParams, setSearchParams]);

  useEffect(() => {
    const newSearchParams = new URLSearchParams(searchParams);

    let updated = false;

    if (!urlCurrent) {
      if (currentRef.current) {
        newSearchParams.set('address', encodeAddress(currentRef.current, chainSS58));
        updated = true;
      }
    }

    if (updated) {
      setSearchParams(newSearchParams, { replace: true });
    }

    if (urlCurrent) {
      useAddressStore.setState({ current: encodeAddress(urlCurrent, chainSS58) });
    }
  }, [chainSS58, searchParams, setSearchParams, urlCurrent]);
}
