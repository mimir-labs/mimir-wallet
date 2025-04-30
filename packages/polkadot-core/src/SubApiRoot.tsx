// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ValidApiState } from './types.js';

import { isHex } from '@polkadot/util';
import React, { useContext, useMemo } from 'react';

import { ApiContext, SubApiContext } from './context.js';
import { useNetworks } from './useNetworks.js';

type Fallback = React.ComponentType<{ apiState: ValidApiState }>;

function OmniApiRoot({
  children,
  supportedNetworks,
  network: networkOrGenesisHash,
  Fallback
}: {
  network: string; // network or genesisHash
  supportedNetworks?: string[]; // network or genesisHash
  Fallback?: Fallback;
  children: React.ReactNode;
}) {
  const { allApis, chainSS58, ss58Chain, setSs58Chain, setNetwork } = useContext(ApiContext);

  const supportedApis = useMemo(() => {
    return supportedNetworks
      ? Object.fromEntries(
          Object.entries(allApis).filter(([, { genesisHash, network }]) =>
            supportedNetworks.some((networkOrGenesisHash) =>
              isHex(networkOrGenesisHash) ? networkOrGenesisHash === genesisHash : networkOrGenesisHash === network
            )
          )
        )
      : allApis;
  }, [allApis, supportedNetworks]);

  const networkValues = useMemo(() => {
    return isHex(networkOrGenesisHash)
      ? Object.values(allApis).find(({ genesisHash }) => genesisHash === networkOrGenesisHash)
      : allApis[networkOrGenesisHash];
  }, [allApis, networkOrGenesisHash]);

  if (!networkValues || !networkValues.api) {
    return null;
  }

  return (
    <SubApiContext.Provider
      value={{
        ...networkValues,
        chainSS58,
        ss58Chain,
        setSs58Chain,
        allApis: supportedApis,
        network: networkValues.network,
        setNetwork: setNetwork
      }}
    >
      {Fallback && !networkValues.isApiReady ? <Fallback apiState={networkValues} /> : children}
    </SubApiContext.Provider>
  );
}

function SubApiRoot({
  children,
  supportedNetworks,
  network: networkOrGenesisHash,
  Fallback
}: {
  network: string; // network or genesisHash
  supportedNetworks?: string[]; // network or genesisHash
  Fallback?: Fallback;
  children: React.ReactNode;
}): React.ReactNode {
  const { mode } = useNetworks();

  if (mode === 'omni') {
    return (
      <OmniApiRoot supportedNetworks={supportedNetworks} network={networkOrGenesisHash} Fallback={Fallback}>
        {children}
      </OmniApiRoot>
    );
  }

  return children;
}

export default SubApiRoot;
