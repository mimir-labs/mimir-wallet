// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';

import { useAccount } from './useAccounts';
import { useApi } from './useApi';

export function useFollowAccounts() {
  const { network } = useApi();
  const { current } = useAccount();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentRef = useRef<string | undefined>(current);
  const networkRef = useRef<string>(network);

  currentRef.current = current;
  networkRef.current = network;

  useEffect(() => {
    const urlCurrent = searchParams.get('address');
    const urlNetwork = searchParams.get('network');

    const newSearchParams = new URLSearchParams(searchParams);

    if (!urlCurrent || !urlNetwork) {
      currentRef.current && newSearchParams.set('address', currentRef.current);
      newSearchParams.set('network', networkRef.current);
      setSearchParams(newSearchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);
}
