// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useContext, useState } from 'react';

import { ApiContext, SubApiContext } from './context.js';
import { useAllApis } from './useApiStore.js';

function ApiRoot({
  children,
  forceNetwork,
  defaultNetwork
}: {
  forceNetwork?: string;
  defaultNetwork?: string;
  children: React.ReactNode;
}): JSX.Element | null {
  const { chains } = useAllApis();
  const { network: rootNetwork } = useContext(ApiContext);
  const [_network, _setNetwork] = useState<string>(() =>
    defaultNetwork ? (chains[defaultNetwork] ? defaultNetwork : rootNetwork) : rootNetwork
  );

  const network = forceNetwork || _network;
  const networkValues = chains[network];

  if (!networkValues || !networkValues.api) {
    return null;
  }

  return (
    <SubApiContext.Provider
      value={{
        ...networkValues,
        network: network ? network : networkValues.network,
        setNetwork: _setNetwork,
        api: networkValues.api
      }}
    >
      {children}
    </SubApiContext.Provider>
  );
}

export default ApiRoot;
