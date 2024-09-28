// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useEffect } from 'react';

import { useAccount } from './useAccounts';
import { useApi } from './useApi';
import { useQueryParam } from './useQueryParams';

export function useFollowAccounts() {
  const { network } = useApi();
  const { current } = useAccount();

  const [urlAddress, setQueryAddress] = useQueryParam('address');
  const [urlNetwork, setQueryNetwork] = useQueryParam('network');

  useEffect(() => {
    if (urlNetwork !== network.toString()) setQueryNetwork(network.toString(), { replace: true });
  }, [network, setQueryNetwork, urlNetwork]);
  useEffect(() => {
    if (current) {
      if (current !== urlAddress) setQueryAddress(current, { replace: true });
    } else {
      setQueryAddress(undefined, { replace: true });
    }
  }, [setQueryAddress, urlAddress, current]);
}
