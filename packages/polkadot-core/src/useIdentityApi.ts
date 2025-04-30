// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useContext } from 'react';

import { ApiContext } from './context.js';
import { useAllApis } from './useApiStore.js';
import { useNetworks } from './useNetworks.js';

export function useIdentityApi() {
  const { mode, networks } = useNetworks();
  const rootApi = useContext(ApiContext);
  const { chains } = useAllApis();

  if (mode === 'omni') {
    const identityNetwork =
      networks.find((network) => network.key === rootApi.ss58Chain)?.identityNetwork || rootApi.ss58Chain;

    return chains[identityNetwork] ? chains[identityNetwork] : null;
  }

  return rootApi.chain.identityNetwork ? chains[rootApi.chain.identityNetwork] : rootApi;
}
