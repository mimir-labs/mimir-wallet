// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { CURRENT_ADDRESS_HEX_KEY, CURRENT_NETWORK_KEY } from '@/constants';
import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';

import { addressToHex, encodeAddress, useApi } from '@mimir-wallet/polkadot-core';
import { store } from '@mimir-wallet/service';

import { useAddressStore } from './useAddressStore';

export function useFollowAccounts() {
  const { network, chainSS58 } = useApi();
  const { current } = useAddressStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentRef = useRef<string | undefined>(current);
  const networkRef = useRef<string>(network);

  currentRef.current = current;
  networkRef.current = network;
  const urlCurrent = searchParams.get('address');
  const urlNetwork = searchParams.get('network');

  useEffect(() => {
    if (!(urlCurrent && urlNetwork)) {
      const newSearchParams = new URLSearchParams(searchParams);

      currentRef.current && newSearchParams.set('address', encodeAddress(currentRef.current, chainSS58));
      newSearchParams.set('network', networkRef.current);
      setSearchParams(newSearchParams, { replace: true });
    }

    if (urlCurrent && urlNetwork) {
      store.set(CURRENT_ADDRESS_HEX_KEY, addressToHex(urlCurrent));
      store.set(CURRENT_NETWORK_KEY, urlNetwork);
      useAddressStore.setState({ current: encodeAddress(urlCurrent, chainSS58) });
    }
  }, [chainSS58, searchParams, setSearchParams, urlCurrent, urlNetwork]);
}
