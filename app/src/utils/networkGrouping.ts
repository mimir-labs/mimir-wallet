// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { type Network } from '@mimir-wallet/polkadot-core';

export function groupNetworksByChain(
  networks: Network[],
  showAll: boolean,
  ss58Chain?: string
): Record<string, Network[]> {
  const groupedEndpoints = networks
    .filter((item) => (showAll ? true : !!item.enabled))
    .reduce(
      (acc, network) => {
        if (network.isRelayChain) {
          acc[network.key] = [network, ...(acc[network.key] || [])];
        } else if (network.relayChain) {
          acc[network.relayChain] = [...(acc[network.relayChain] || []), network];
        } else {
          acc['solochain'] = [...(acc['solochain'] || []), network];
        }

        return acc;
      },
      {} as Record<string, Network[]>
    );

  // Move selected network to position 3 if it's in polkadot and in the first 3 positions
  if (ss58Chain) {
    const polkadotNetworks = groupedEndpoints['polkadot'] || [];
    const selectedNetwork = polkadotNetworks.find((network) => network.key === ss58Chain);

    if (selectedNetwork && polkadotNetworks.indexOf(selectedNetwork) < 3) {
      const index = polkadotNetworks.indexOf(selectedNetwork);

      polkadotNetworks.splice(index, 1);
      polkadotNetworks.splice(3, 0, selectedNetwork);
    }
  }

  return groupedEndpoints;
}
