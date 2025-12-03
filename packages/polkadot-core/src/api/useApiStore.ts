// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ChainStatus, Endpoint, Network } from '../types/types.js';

import { store } from '@mimir-wallet/service';
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

import { allEndpoints } from '../chains/config.js';
import { DEFAULE_SS58_CHAIN_KEY } from '../utils/defaults.js';

import { ApiManager } from './ApiManager.js';

// ============================================================================
// Constants
// ============================================================================

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

// ============================================================================
// Initialization Functions
// ============================================================================

function initNetworks(): Network[] {
  let enabledNetworks = store.get(ENABLED_NETWORKS_KEY) as string[] | undefined;

  if (!enabledNetworks || !Array.isArray(enabledNetworks) || enabledNetworks.length === 0) {
    enabledNetworks = DEFAULT_NETWORKS;
  }

  store.set(ENABLED_NETWORKS_KEY, enabledNetworks);

  // Add user references for initially enabled networks
  const apiManager = ApiManager.getInstance();

  enabledNetworks.forEach((key) => {
    apiManager.addReference(key, 'user');
  });

  return allEndpoints.map((item) => ({ ...item, enabled: enabledNetworks!.includes(item.key) }));
}

function initNetworkMode(): 'omni' | 'solo' {
  return (store.get(NETWORK_MODE_KEY) as 'omni' | 'solo') || 'omni';
}

function initSs58Chain(): string {
  const stored = store.get(DEFAULE_SS58_CHAIN_KEY) as string | undefined;

  // Validate stored value against available endpoints
  if (stored && allEndpoints.some((e) => e.key === stored)) {
    return stored;
  }

  // Default to first endpoint
  const defaultChain = allEndpoints[0]?.key ?? 'polkadot';

  store.set(DEFAULE_SS58_CHAIN_KEY, defaultChain);

  return defaultChain;
}

// ============================================================================
// Store Definition
// ============================================================================

export interface ApiState {
  // Chain statuses from ApiManager
  chainStatuses: Record<string, ChainStatus>;

  // Network management (from useChains)
  networks: Network[];
  networkMode: 'omni' | 'solo';

  // SS58 format (from useSs58Format)
  ss58Chain: string;

  // Internal actions
  _syncChainStatuses: (statuses: Record<string, ChainStatus>) => void;

  // Network actions
  enableNetwork: (key: string) => void;
  disableNetwork: (key: string) => void;
  setNetworkMode: (mode: 'omni' | 'solo', callback?: () => void) => void;

  // SS58 actions
  setSs58Chain: (chain: string) => void;
}

export const useApiStore = create<ApiState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    chainStatuses: {},
    networks: initNetworks(),
    networkMode: initNetworkMode(),
    ss58Chain: initSs58Chain(),

    // Sync chain statuses from ApiManager
    _syncChainStatuses: (statuses) => set({ chainStatuses: statuses }),

    // Network management actions
    enableNetwork: (key: string) => {
      const { networkMode, networks } = get();

      if (networkMode !== 'omni') return;

      const target = networks.find((n) => n.key === key || n.genesisHash === key);

      if (!target || target.enabled) return;

      const newNetworks = networks.map((n) => ({
        ...n,
        enabled: n.key === key || n.genesisHash === key ? true : n.enabled
      }));

      // Add user reference when enabling network
      ApiManager.getInstance().addReference(target.key, 'user');
      ApiManager.getInstance().initialize(target);

      // Persist and update state
      store.set(
        ENABLED_NETWORKS_KEY,
        newNetworks.filter((n) => n.enabled).map((n) => n.key)
      );
      set({ networks: newNetworks });
    },

    disableNetwork: (key: string) => {
      const { networkMode, networks } = get();

      if (networkMode !== 'omni') return;

      const target = networks.find((n) => n.key === key);

      if (!target || !target.enabled) return;

      // Must keep at least one network enabled
      const enabledCount = networks.filter((n) => n.enabled).length;

      if (enabledCount === 1) return;

      const newNetworks = networks.map((n) => ({
        ...n,
        enabled: n.key === key ? false : n.enabled
      }));

      // Remove user reference and destroy connection if no references remain
      const shouldDestroy = ApiManager.getInstance().removeReference(key, 'user');

      if (shouldDestroy) {
        ApiManager.getInstance().destroy(key);
      }

      // Persist and update state
      store.set(
        ENABLED_NETWORKS_KEY,
        newNetworks.filter((n) => n.enabled).map((n) => n.key)
      );
      set({ networks: newNetworks });
    },

    setNetworkMode: (newMode: 'omni' | 'solo', callback?: () => void) => {
      store.set(NETWORK_MODE_KEY, newMode);
      set({ networkMode: newMode });
      callback?.();
    },

    // SS58 format actions
    setSs58Chain: (chain: string) => {
      // Validate chain exists
      const target = allEndpoints.find((e) => e.key === chain || e.genesisHash === chain);

      if (!target) return;

      store.set(DEFAULE_SS58_CHAIN_KEY, target.key);
      set({ ss58Chain: target.key });
    }
  }))
);

// ============================================================================
// ApiManager Subscription
// ============================================================================

// Subscribe to ApiManager and sync statuses to Zustand store
ApiManager.getInstance().subscribe((apis) => {
  const statuses: Record<string, ChainStatus> = {};

  for (const [key, connection] of Object.entries(apis)) {
    statuses[key] = connection.status;
  }

  useApiStore.getState()._syncChainStatuses(statuses);
});

// ============================================================================
// External Access Functions (for use outside React components)
// ============================================================================

/**
 * Get network mode (for use outside of React components)
 */
export function getNetworkMode(): 'omni' | 'solo' {
  return useApiStore.getState().networkMode;
}

/**
 * Get current SS58 chain (for use outside of React components)
 */
export function getSs58Chain(): string {
  return useApiStore.getState().ss58Chain;
}

/**
 * Get SS58 chain info (for use outside of React components)
 */
export function getSs58ChainInfo(): Endpoint {
  const ss58Chain = useApiStore.getState().ss58Chain;

  return ApiManager.resolveChain(ss58Chain) ?? allEndpoints[0];
}

/**
 * Set SS58 chain (for use outside of React components)
 */
export function setSs58ChainExternal(chain: string): void {
  useApiStore.getState().setSs58Chain(chain);
}
