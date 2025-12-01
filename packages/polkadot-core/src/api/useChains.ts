// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Network } from '../types/types.js';

import { store } from '@mimir-wallet/service';
import { useSyncExternalStore } from 'react';

import { allEndpoints } from '../chains/config.js';

import { ApiManager } from './ApiManager.js';

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

// Internal state
let networks: Network[] = initNetworks();
let mode: 'omni' | 'solo' = initMode();
const listeners = new Set<() => void>();

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

function initMode(): 'omni' | 'solo' {
  return (store.get(NETWORK_MODE_KEY) as 'omni' | 'solo') || 'omni';
}

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

function persistNetworks() {
  store.set(
    ENABLED_NETWORKS_KEY,
    networks.filter((n) => n.enabled).map((n) => n.key)
  );
}

/**
 * Chains control interface returned by useChains hook
 */
export interface ChainsControl {
  /** All supported chains with enabled status */
  chains: Network[];
  /** Network mode: 'omni' (multi-network) or 'solo' (single network) */
  mode: 'omni' | 'solo';
  /** Enable a network by key or genesis hash */
  enableNetwork: (key: string) => void;
  /** Disable a network by key */
  disableNetwork: (key: string) => void;
  /** Set network mode */
  setNetworkMode: (mode: 'omni' | 'solo', callback?: () => void) => void;
}

// Snapshot object for useSyncExternalStore
let snapshot = { networks, mode };

function getSnapshot() {
  return snapshot;
}

function updateSnapshot() {
  snapshot = { networks, mode };
}

// Stable subscribe function at module level
function subscribe(onStoreChange: () => void): () => void {
  listeners.add(onStoreChange);

  return () => listeners.delete(onStoreChange);
}

// Stable action functions at module level (they don't depend on component state)
function enableNetwork(key: string): void {
  if (mode !== 'omni') return;

  const target = networks.find((n) => n.key === key || n.genesisHash === key);

  if (!target || target.enabled) return;

  networks = networks.map((n) => ({
    ...n,
    enabled: n.key === key || n.genesisHash === key ? true : n.enabled
  }));

  // Add user reference when enabling network
  ApiManager.getInstance().addReference(target.key, 'user');

  persistNetworks();
  updateSnapshot();
  notifyListeners();
}

function disableNetwork(key: string): void {
  if (mode !== 'omni') return;

  const target = networks.find((n) => n.key === key);

  if (!target || !target.enabled) return;

  // Must keep at least one network enabled
  const enabledCount = networks.filter((n) => n.enabled).length;

  if (enabledCount === 1) return;

  networks = networks.map((n) => ({
    ...n,
    enabled: n.key === key ? false : n.enabled
  }));

  // Remove user reference and destroy connection if no references remain
  const shouldDestroy = ApiManager.getInstance().removeReference(key, 'user');

  if (shouldDestroy) {
    ApiManager.getInstance().destroy(key);
  }

  persistNetworks();
  updateSnapshot();
  notifyListeners();
}

function setNetworkMode(newMode: 'omni' | 'solo', callback?: () => void): void {
  mode = newMode;
  store.set(NETWORK_MODE_KEY, newMode);
  updateSnapshot();
  notifyListeners();
  callback?.();
}

// Stable return object (functions are module-level, so they're always the same reference)
const stableActions = {
  enableNetwork,
  disableNetwork,
  setNetworkMode
};

/**
 * Hook to manage all supported chains
 * Replaces useNetworks with a cleaner API
 *
 * @example
 * ```tsx
 * const { chains, mode, enableNetwork, disableNetwork } = useChains();
 *
 * // Get enabled chains
 * const enabledChains = chains.filter(c => c.enabled);
 *
 * // Enable a network
 * enableNetwork('polkadot');
 *
 * // Disable a network
 * disableNetwork('kusama');
 * ```
 */
export function useChains(): ChainsControl {
  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  return {
    chains: state.networks,
    mode: state.mode,
    ...stableActions
  };
}

/**
 * Get network mode (for use outside of React components)
 */
export function getNetworkMode(): 'omni' | 'solo' {
  return mode;
}
