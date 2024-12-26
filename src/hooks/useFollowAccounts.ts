// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';

import { CURRENT_ADDRESS_PREFIX, CURRENT_NETWORK_KEY } from '@mimir-wallet/constants';
import { store } from '@mimir-wallet/utils';

import { useAddressStore } from './useAddressStore';
import { useApi } from './useApi';

export function useFollowAccounts() {
  const { network } = useApi();
  const { current } = useAddressStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentRef = useRef<string | undefined>(current);
  const networkRef = useRef<string>(network);

  currentRef.current = current;
  networkRef.current = network;
  const urlCurrent = searchParams.get('address');
  const urlNetwork = searchParams.get('network');

  useEffect(() => {
    if (!urlCurrent || !urlNetwork) {
      const newSearchParams = new URLSearchParams(searchParams);

      currentRef.current && newSearchParams.set('address', currentRef.current);
      newSearchParams.set('network', networkRef.current);
      setSearchParams(newSearchParams, { replace: true });
    }

    if (urlCurrent && urlNetwork) {
      store.set(`${CURRENT_ADDRESS_PREFIX}${urlNetwork}`, urlCurrent);
      store.set(CURRENT_NETWORK_KEY, urlNetwork);
      useAddressStore.setState({ current: urlCurrent });
    }
  }, [searchParams, setSearchParams, urlCurrent, urlNetwork]);
}
