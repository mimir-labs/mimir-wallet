// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useChains } from '@mimir-wallet/polkadot-core';

export function useInputNetwork(defaultNetwork?: string, supportedNetworks?: string[]) {
  const { chains, enableNetwork, mode } = useChains();

  // Get enabled network keys as a Set for fast lookup
  const enabledNetworks = useMemo(() => new Set(chains.filter((c) => c.enabled).map((c) => c.key)), [chains]);

  // Get first enabled network as default fallback
  const firstEnabledNetwork = useMemo(() => {
    const enabled = chains.find((c) => c.enabled);

    return enabled?.key || 'polkadot';
  }, [chains]);

  const [network, setNetwork] = useState(supportedNetworks?.at(0) || defaultNetwork || firstEnabledNetwork);

  const enabledNetworksRef = useRef(enabledNetworks);

  useEffect(() => {
    enabledNetworksRef.current = enabledNetworks;
  }, [enabledNetworks]);

  useEffect(() => {
    queueMicrotask(() => {
      if (mode === 'omni') {
        if (!supportedNetworks || supportedNetworks.length === 0) {
          if (!enabledNetworksRef.current.has(network)) {
            setNetwork(firstEnabledNetwork);
          }
        } else {
          if (!supportedNetworks.includes(network)) {
            const newNetwork = supportedNetworks[0];

            setNetwork(newNetwork);
          }
        }
      }
    });
  }, [network, supportedNetworks, mode, firstEnabledNetwork]);

  useEffect(() => {
    if (mode === 'omni' && !enabledNetworksRef.current.has(network)) {
      enableNetwork(network);
    }
  }, [network, enableNetwork, mode]);

  return [
    network,
    useCallback(
      (newNetwork: string) => {
        if (mode === 'omni') {
          setNetwork(newNetwork);
        }
      },
      [mode]
    )
  ] as const;
}
