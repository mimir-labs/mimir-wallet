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
const NETWORK_MODE_KEY = 'network_mode';

function getNetworkMode(): 'omni' | 'solo' {
  return (store.get(NETWORK_MODE_KEY) as 'omni' | 'solo') || 'omni';
}

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

/**
 * Enable a network in omni mode
 *
 * When enabling a network, this function automatically enables dependent networks:
 * - Identity network: For chains that store identity data on a separate chain
 * - Relay chain: For all parachains (chains with relayChain configured)
 *
 * @param key - The network key or genesis hash to enable
 *
 * @remarks
 * - Only works in omni mode; does nothing in solo mode
 * - Automatically enables identity network if configured
 * - Automatically enables relay chain for all parachains
 * - No-op if the network is already enabled
 */
export function enableNetwork(key: string) {
  useNetworks.setState((state) => {
    // Only allow network management in omni mode
    if (state.mode !== 'omni') {
      return state;
    }

    const targetNetwork = state.networks.find((item) => item.key === key || item.genesisHash === key);
    const identityNetwork = targetNetwork?.identityNetwork;
    const relayChain = targetNetwork?.relayChain;

    // If already enabled, no changes needed
    if (state.networks.some((network) => network.enabled && network.key === key)) {
      return { networks: state.networks };
    }

    return {
      networks: state.networks.map((item) => ({
        ...item,
        enabled:
          // Enable the target network
          key === item.key || key === item.genesisHash
            ? true
            : // Enable identity network if the target requires it
              identityNetwork === item.key
              ? true
              : // Enable relay chain if the target is a parachain
                relayChain === item.key
                ? true
                : // Keep existing enabled state for other networks
                  item.enabled
      })) as [Network, ...Network[]]
    };
  });
}

export const useNetworks = create<{
  networks: [Network, ...Network[]];
  mode: 'omni' | 'solo';
  enableNetwork: (key: string) => void;
  disableNetwork: (key: string) => void;
  setNetworkMode: (mode: 'omni' | 'solo', cb?: () => void) => void;
}>()((set) => ({
  networks: getEnabledNetworks(),
  mode: getNetworkMode(),
  enableNetwork: enableNetwork,
  /**
   * Disable a network in omni mode
   *
   * This function prevents disabling networks that are required by other enabled networks:
   * - Relay chains required by any enabled parachain cannot be disabled
   * - At least one network must remain enabled at all times
   *
   * @param key - The network key to disable
   *
   * @remarks
   * - Only works in omni mode; does nothing in solo mode
   * - Cannot disable the last enabled network
   * - Cannot disable relay chains required by any enabled parachains
   * - No-op if the network is already disabled
   */
  disableNetwork: (key: string) => {
    set((state) => {
      // Only allow network management in omni mode
      if (state.mode !== 'omni') {
        return state;
      }

      // Check if this relay chain is required by any enabled parachain
      // All parachains need their relay chain for various operations
      const isRequiredRelayChain = state.networks.some((network) => network.enabled && network.relayChain === key);

      if (isRequiredRelayChain) {
        // Cannot disable relay chain if required by any enabled parachains
        console.warn(`Cannot disable relay chain ${key}: required by enabled parachains`);

        return state;
      }

      // Must keep at least one network enabled
      const enabledCount = state.networks.filter((item) => item.enabled).length;

      if (enabledCount === 1) {
        return state;
      }

      // If already disabled, no changes needed
      if (state.networks.some((network) => !network.enabled && network.key === key)) {
        return state;
      }

      return {
        networks: state.networks.map((item) => ({
          ...item,
          enabled: key === item.key ? false : item.enabled
        })) as [Network, ...Network[]]
      };
    });
  },
  setNetworkMode: (mode: 'omni' | 'solo', cb?: () => void) => {
    store.set(NETWORK_MODE_KEY, mode);

    if (cb) {
      cb();
    }
  }
}));

useNetworks.subscribe((state) => {
  store.set(
    ENABLED_NETWORKS_KEY,
    Array.from(new Set([...state.networks.filter((item) => item.enabled).map((item) => item.key)]))
  );
});
