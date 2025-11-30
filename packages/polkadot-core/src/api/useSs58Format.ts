// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Ss58FormatControl } from '../types.js';

import { useSyncExternalStore } from 'react';

import { store } from '@mimir-wallet/service';

import { allEndpoints } from '../config.js';
import { DEFAULE_SS58_CHAIN_KEY } from '../defaults.js';
import { ApiManager } from './ApiManager.js';

// Internal state
let ss58Chain: string = initSs58Chain();
const listeners = new Set<() => void>();

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

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

// Snapshot for useSyncExternalStore
let snapshot = createSnapshot();

function createSnapshot() {
  const chainInfo = ApiManager.resolveChain(ss58Chain) ?? allEndpoints[0];

  return {
    ss58: chainInfo.ss58Format,
    ss58Chain,
    chainInfo
  };
}

function getSnapshot() {
  return snapshot;
}

function updateSnapshot() {
  snapshot = createSnapshot();
}

// Stable subscribe function at module level
function subscribe(onStoreChange: () => void): () => void {
  listeners.add(onStoreChange);

  return () => listeners.delete(onStoreChange);
}

// Stable action function at module level
function setSs58Chain(chain: string): void {
  // Validate chain exists
  const target = allEndpoints.find((e) => e.key === chain || e.genesisHash === chain);

  if (!target) return;

  ss58Chain = target.key;
  store.set(DEFAULE_SS58_CHAIN_KEY, ss58Chain);
  updateSnapshot();
  notifyListeners();
}

/**
 * Hook to control SS58 format for address display
 *
 * SS58 format determines how addresses are encoded and displayed.
 * Different chains use different SS58 prefixes (e.g., Polkadot uses 0, Kusama uses 2).
 *
 * @returns Ss58FormatControl object with SS58 format and control functions
 *
 * @example
 * ```tsx
 * const { ss58, chainInfo, setSs58Chain } = useSs58Format();
 *
 * // Display current SS58 format
 * console.log(`Current format: ${ss58} (${chainInfo.name})`);
 *
 * // Change SS58 chain
 * setSs58Chain('kusama');
 * ```
 */
export function useSs58Format(): Ss58FormatControl {
  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  return {
    ss58: state.ss58,
    ss58Chain: state.ss58Chain,
    chainInfo: state.chainInfo,
    setSs58Chain
  };
}

/**
 * Get current SS58 chain (for use outside of React components)
 */
export function getSs58Chain(): string {
  return ss58Chain;
}

/**
 * Set SS58 chain (for use outside of React components)
 */
export function setSs58ChainExternal(chain: string): void {
  const target = allEndpoints.find((e) => e.key === chain || e.genesisHash === chain);

  if (!target) return;

  ss58Chain = target.key;
  store.set(DEFAULE_SS58_CHAIN_KEY, ss58Chain);
  updateSnapshot();
  notifyListeners();
}
