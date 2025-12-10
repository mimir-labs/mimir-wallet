// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ChainStatus, Network } from '../types/types.js';

import { store } from '@mimir-wallet/service';
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

import { allEndpoints } from '../chains/config.js';
import {
  DEFAULE_SS58_CHAIN_KEY,
  ENABLED_NETWORKS_KEY,
  NETWORK_MODE_KEY,
} from '../utils/defaults.js';

import { ApiManager } from './ApiManager.js';

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
    // Initial state (will be set by initializeApiStore in initMimir)
    chainStatuses: {},
    networks: [],
    networkMode: 'omni',
    ss58Chain: allEndpoints[0]?.key ?? 'polkadot',

    // Sync chain statuses from ApiManager
    _syncChainStatuses: (statuses) => {
      set({ chainStatuses: statuses });
    },

    // Network management actions
    enableNetwork: (key: string) => {
      const { networkMode, networks } = get();

      if (networkMode !== 'omni') return;

      const target = networks.find(
        (n) => n.key === key || n.genesisHash === key,
      );

      if (!target || target.enabled) return;

      const newNetworks = networks.map((n) => ({
        ...n,
        enabled: n.key === key || n.genesisHash === key ? true : n.enabled,
      }));

      // Add user reference when enabling network
      ApiManager.getInstance().addReference(target.key, 'user');
      ApiManager.getInstance().initialize(target);

      // Persist and update state
      store.set(
        ENABLED_NETWORKS_KEY,
        newNetworks.filter((n) => n.enabled).map((n) => n.key),
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
        enabled: n.key === key ? false : n.enabled,
      }));

      // Remove user reference and destroy connection if no references remain
      const shouldDestroy = ApiManager.getInstance().removeReference(
        key,
        'user',
      );

      if (shouldDestroy) {
        ApiManager.getInstance().destroy(key);
      }

      // Persist and update state
      store.set(
        ENABLED_NETWORKS_KEY,
        newNetworks.filter((n) => n.enabled).map((n) => n.key),
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
      const target = allEndpoints.find(
        (e) => e.key === chain || e.genesisHash === chain,
      );

      if (!target) return;

      store.set(DEFAULE_SS58_CHAIN_KEY, target.key);
      set({ ss58Chain: target.key });
    },
  })),
);

// ============================================================================
// ApiManager Subscription
// ============================================================================

// Pending statuses for batched update
let pendingStatuses: Record<string, ChainStatus> | null = null;

// Subscribe to ApiManager and sync statuses to Zustand store
// Uses queueMicrotask to batch multiple rapid calls and avoid updating during React render
ApiManager.getInstance().subscribe((apis) => {
  // Collect statuses
  const statuses: Record<string, ChainStatus> = {};

  for (const [key, connection] of Object.entries(apis)) {
    statuses[key] = connection.status;
  }

  // If already pending, just update the pending statuses (will be processed in the queued microtask)
  if (pendingStatuses) {
    pendingStatuses = statuses;

    return;
  }

  // Queue the update
  pendingStatuses = statuses;
  queueMicrotask(() => {
    if (pendingStatuses) {
      useApiStore.getState()._syncChainStatuses(pendingStatuses);
      pendingStatuses = null;
    }
  });
});

// ============================================================================
// External Access Functions (for use outside React components)
// ============================================================================

/**
 * Initialize ApiStore with values from initMimir
 * Sets networks, networkMode, ss58Chain and ApiManager references
 */
export function initializeApiStore(params: {
  enabledNetworks: string[];
  networkMode: 'omni' | 'solo';
  ss58Chain: string;
}): void {
  const { enabledNetworks, networkMode, ss58Chain } = params;

  // Build networks array with enabled status
  const networks: Network[] = allEndpoints.map((item) => ({
    ...item,
    enabled: enabledNetworks.includes(item.key),
  }));

  // Set store state
  useApiStore.setState({
    networks,
    networkMode,
    ss58Chain,
  });

  // Add ApiManager references for enabled networks
  const apiManager = ApiManager.getInstance();

  enabledNetworks.forEach((key) => {
    apiManager.addReference(key, 'user');
  });
}
