// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useCallback, useEffect, useRef, useState } from 'react';

import { useApi, useNetworks } from '@mimir-wallet/polkadot-core';

export function useInputNetwork(defaultNetwork?: string, supportedNetworks?: string[]) {
  const { allApis, network: rootNetwork, setNetwork: setRootNetwork } = useApi();
  const { enableNetwork } = useNetworks();
  const [network, setNetwork] = useState(supportedNetworks?.at(0) || defaultNetwork || rootNetwork);

  const allApisRef = useRef(allApis);

  allApisRef.current = allApis;

  useEffect(() => {
    if (!supportedNetworks || supportedNetworks.length === 0) {
      if (!allApisRef.current[network]) {
        setNetwork(rootNetwork);
      }
    } else {
      if (!supportedNetworks.includes(network)) {
        const network = supportedNetworks[0];

        setNetwork(network);
      }
    }
  }, [network, supportedNetworks, rootNetwork]);

  useEffect(() => {
    if (!allApisRef.current[network]) {
      enableNetwork(network);
    }
  }, [network, enableNetwork]);

  return [
    network,
    useCallback(
      (network: string) => {
        setNetwork(network);
        setRootNetwork(network);
      },
      [setRootNetwork]
    )
  ] as const;
}
