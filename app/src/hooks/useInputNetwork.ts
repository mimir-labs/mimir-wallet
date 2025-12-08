// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useChains, useNetwork } from '@mimir-wallet/polkadot-core';
import { useEffect, useMemo, useRef, useState } from 'react';

export function useInputNetwork(
  defaultNetwork?: string,
  supportedNetworks?: string[],
) {
  const { chains, mode } = useChains();
  const { network: initialNetwork } = useNetwork();

  // Get enabled network keys as a Set for fast lookup
  const enabledNetworks = useMemo(
    () => new Set(chains.filter((c) => c.enabled).map((c) => c.key)),
    [chains],
  );

  const [network, setNetwork] = useState(
    supportedNetworks?.at(0) ||
      defaultNetwork ||
      enabledNetworks.values().next().value ||
      initialNetwork,
  );

  const enabledNetworksRef = useRef(enabledNetworks);

  useEffect(() => {
    enabledNetworksRef.current = enabledNetworks;
  }, [enabledNetworks]);

  useEffect(() => {
    queueMicrotask(() => {
      if (mode === 'omni') {
        if (!supportedNetworks || supportedNetworks.length === 0) {
          if (!enabledNetworksRef.current.has(network)) {
            setNetwork(initialNetwork);
          }
        } else {
          if (!supportedNetworks.includes(network)) {
            const newNetwork = supportedNetworks[0];

            setNetwork(newNetwork);
          }
        }
      }
    });
  }, [network, supportedNetworks, mode, initialNetwork]);

  return [
    network,
    (newNetwork: string) => {
      if (
        mode === 'omni' &&
        (!supportedNetworks || supportedNetworks.includes(newNetwork))
      ) {
        setNetwork(newNetwork);
      }
    },
  ] as const;
}
