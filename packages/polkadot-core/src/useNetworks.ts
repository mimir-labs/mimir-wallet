// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Network } from './types.js';

import { create } from 'zustand';

import { store } from '@mimir-wallet/service';

import { allEndpoints } from './config.js';

const DEFAULT_NETWORKS = [
  'polkadot',
  'kusama',
  'assethub-polkadot',
  'people-polkadot',
  'assethub-kusama',
  'people-kusama'
];

const ENABLED_NETWORKS_KEY = 'enabled_networks';

function getEnabledNetworks(): [Network, ...Network[]] {
  let enabledNetworks = store.get(ENABLED_NETWORKS_KEY) as string[] | undefined;

  if (!enabledNetworks || !Array.isArray(enabledNetworks)) {
    enabledNetworks = DEFAULT_NETWORKS;
  }

  if (enabledNetworks.length === 0) {
    enabledNetworks = DEFAULT_NETWORKS;
  }

  store.set(ENABLED_NETWORKS_KEY, enabledNetworks);

  return allEndpoints.map((item): Network => ({ ...item, enabled: enabledNetworks.includes(item.key) })) as [
    Network,
    ...Network[]
  ];
}

export function enableNetwork(key: string) {
  useNetworks.setState((state) => {
    const identityNetwork = state.networks.find(
      (item) => item.key === key || item.genesisHash === key
    )?.identityNetwork;

    return {
      networks: state.networks.some((network) => network.enabled && network.key === key)
        ? state.networks
        : (state.networks.map((item) => ({
            ...item,
            enabled:
              key === item.key || key === item.genesisHash ? true : identityNetwork === item.key ? true : item.enabled
          })) as [Network, ...Network[]])
    };
  });
}

export const useNetworks = create<{
  networks: [Network, ...Network[]];
  enableNetwork: (key: string) => void;
  disableNetwork: (key: string) => void;
}>()((set) => ({
  networks: getEnabledNetworks(),
  enableNetwork: enableNetwork,
  disableNetwork: (key: string) => {
    set((state) => {
      return {
        networks:
          state.networks.filter((item) => item.enabled).length === 1
            ? state.networks
            : state.networks.some((network) => !network.enabled && network.key === key)
              ? state.networks
              : (state.networks.map((item) => ({ ...item, enabled: key === item.key ? false : item.enabled })) as [
                  Network,
                  ...Network[]
                ])
      };
    });
  }
}));

useNetworks.subscribe((state) => {
  store.set(
    ENABLED_NETWORKS_KEY,
    Array.from(new Set([...state.networks.filter((item) => item.enabled).map((item) => item.key)]))
  );
});
