// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Network } from '../types/types.js';

import { useMemo } from 'react';
import { useShallow } from 'zustand/shallow';

import { useNetwork } from '../context/NetworkContext.js';

import { useApiStore } from './useApiStore.js';

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

/**
 * Hook to manage all supported chains
 * Uses Zustand store for state management
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
  const {
    networks,
    networkMode,
    enableNetwork,
    disableNetwork,
    setNetworkMode,
  } = useApiStore(
    useShallow((state) => ({
      networks: state.networks,
      networkMode: state.networkMode,
      enableNetwork: state.enableNetwork,
      disableNetwork: state.disableNetwork,
      setNetworkMode: state.setNetworkMode,
    })),
  );

  const { network } = useNetwork();

  const chains = useMemo(
    () =>
      networks.map(
        (item): Network => ({
          ...item,
          enabled: networkMode === 'omni' ? item.enabled : item.key === network,
        }),
      ),
    [networks, networkMode, network],
  );

  return {
    chains,
    mode: networkMode,
    enableNetwork,
    disableNetwork,
    setNetworkMode,
  };
}

// Re-export getNetworkMode from useApiStore for backward compatibility
export { getNetworkMode } from './useApiStore.js';
