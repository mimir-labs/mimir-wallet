// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useLayoutEffect, useRef, useState } from 'react';

import { useApi, useNetworks } from '@mimir-wallet/polkadot-core';

export function useInputNetwork(defaultNetwork?: string, supportedNetworks?: string[]) {
  const { network: currentNetwork, allApis } = useApi();
  const { enableNetwork } = useNetworks();
  const [network, setNetwork] = useState(supportedNetworks?.at(0) || defaultNetwork || currentNetwork);

  const allApisRef = useRef(allApis);

  allApisRef.current = allApis;

  useLayoutEffect(() => {
    if (!supportedNetworks || supportedNetworks.length === 0) {
      if (!allApisRef.current[network]) {
        setNetwork(currentNetwork);
      }
    } else {
      if (!supportedNetworks.includes(network)) {
        const network = supportedNetworks[0];

        setNetwork(network);
      }
    }
  }, [currentNetwork, network, supportedNetworks]);

  useEffect(() => {
    if (!allApisRef.current[network]) {
      enableNetwork(network);
    }
  }, [network, enableNetwork]);

  return [network, setNetwork] as const;
}
