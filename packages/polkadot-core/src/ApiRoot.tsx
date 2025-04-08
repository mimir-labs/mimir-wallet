// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Endpoint } from './types.js';

import React, { useState } from 'react';

import { ApiContext } from './context.js';
import { useAllApis } from './useApiStore.js';

function ApiRoot({ chain, children }: { chain: Endpoint; children: React.ReactNode }): JSX.Element | null {
  const [network, setNetwork] = useState<string>(chain.key);
  const { chains } = useAllApis();
  const networkValues = chains[network];

  if (!networkValues || !networkValues.api) {
    return null;
  }

  return (
    <ApiContext.Provider
      value={{
        ...networkValues,
        network: network ? network : networkValues.network,
        setNetwork: setNetwork,
        api: networkValues.api
      }}
    >
      {children}
    </ApiContext.Provider>
  );
}

export default ApiRoot;
