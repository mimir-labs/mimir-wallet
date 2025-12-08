// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { remoteProxyRelations, useChains } from '@mimir-wallet/polkadot-core';
import { useMemo } from 'react';

import { useAddressMeta } from '@/accounts/useAddressMeta';

/**
 * Get supported networks by address
 *
 * @param address - The address to check
 * @returns Array of supported networks, or undefined if all networks are supported
 */
export function useAddressSupportedNetworks(address?: string | null) {
  const { chains } = useChains();
  const { meta } = useAddressMeta(address);

  const supportedNetwork = useMemo(() => {
    if (meta.isPure) {
      const genesisHashes = new Set<string>();

      // Add the network where the pure address was created
      if (meta.pureCreatedAt) {
        genesisHashes.add(meta.pureCreatedAt);

        // Add remote proxy relation if exists
        if (remoteProxyRelations[meta.pureCreatedAt]) {
          genesisHashes.add(remoteProxyRelations[meta.pureCreatedAt]);
        }
      }

      // Add proxy networks
      if (meta.proxyNetworks && meta.proxyNetworks.length > 0) {
        meta.proxyNetworks.forEach((network) => genesisHashes.add(network));
      }

      const supported = chains.filter((item) =>
        genesisHashes.has(item.genesisHash),
      );

      return supported;
    }

    return undefined;
  }, [meta.isPure, meta.pureCreatedAt, meta.proxyNetworks, chains]);

  return useMemo(
    () => (supportedNetwork ? supportedNetwork : undefined),
    [supportedNetwork],
  );
}
