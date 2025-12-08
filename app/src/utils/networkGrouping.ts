// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import {
  allEndpoints,
  type Endpoint,
  type Network,
} from '@mimir-wallet/polkadot-core';

/**
 * Get all chains that have Subscan explorer support
 * @returns Array of endpoints with explorerUrl
 */
export function getChainsWithSubscanSupport(): Endpoint[] {
  return allEndpoints.filter((endpoint) => !!endpoint.explorerUrl);
}

/**
 * Check if a specific chain has Subscan support
 * @param chainKey - The chain key or genesis hash
 * @returns Boolean indicating if chain has Subscan support
 */
export function hasSubscanSupport(chainKey: string): boolean {
  const endpoint = allEndpoints.find(
    (e) => e.key === chainKey || e.genesisHash === chainKey,
  );

  return !!endpoint?.explorerUrl;
}

export function groupNetworksByChain(
  networks: Network[],
  showAll: boolean,
  ss58Chain?: string,
): Record<string, Network[]> {
  const groupedEndpoints = networks
    .filter((item) => (showAll ? true : !!item.enabled))
    .reduce(
      (acc, network) => {
        if (network.isRelayChain) {
          acc[network.key] = [network, ...(acc[network.key] || [])];
        } else if (network.relayChain) {
          acc[network.relayChain] = [
            ...(acc[network.relayChain] || []),
            network,
          ];
        } else {
          acc['solochain'] = [...(acc['solochain'] || []), network];
        }

        return acc;
      },
      {} as Record<string, Network[]>,
    );

  // Move selected network to position 3 if it's in polkadot and in the first 3 positions
  if (ss58Chain) {
    const polkadotNetworks = groupedEndpoints['polkadot'] || [];
    const selectedNetwork = polkadotNetworks.find(
      (network) => network.key === ss58Chain,
    );

    if (selectedNetwork && polkadotNetworks.indexOf(selectedNetwork) < 3) {
      const index = polkadotNetworks.indexOf(selectedNetwork);

      polkadotNetworks.splice(index, 1);
      polkadotNetworks.splice(3, 0, selectedNetwork);
    }
  }

  return groupedEndpoints;
}
