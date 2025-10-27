// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useMemo } from 'react';

import { useApi, useNetworks } from '@mimir-wallet/polkadot-core';

/**
 * Get networks that support proxy module
 *
 * @returns Array of network keys that have proxy pallet available
 */
export function useSupportedNetworksForProxy(): string[] {
  const { allApis } = useApi();
  const { networks } = useNetworks();

  return useMemo(() => {
    return networks
      .filter((network) => {
        const api = allApis[network.key];

        return api?.isApiReady && api?.api?.tx?.proxy;
      })
      .map((network) => network.key);
  }, [allApis, networks]);
}
