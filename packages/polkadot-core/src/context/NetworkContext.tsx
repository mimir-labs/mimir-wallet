// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react-refresh/only-export-components */

import type { Endpoint } from '../types/types.js';
import type { ReactNode } from 'react';

import { createContext, useContext, useMemo } from 'react';

import { useChain } from '../api/index.js';

const DEFAULT_NETWORK = 'polkadot';

interface NetworkContextValue {
  network: string;
  chain: Endpoint;
}

const NetworkContext = createContext<NetworkContextValue | null>(null);

interface NetworkProviderProps {
  network: string;
  children: ReactNode;
}

/**
 * NetworkProvider - Provides network context to child components
 *
 * This replaces the old SubApiRoot component. Child components can use
 * useNetwork() to get the current network, then use ApiManager.getApi(network)
 * to get the API instance.
 *
 * @param network - The network key (e.g., 'polkadot', 'assethub-polkadot')
 * @param children - Child components that will have access to the network context
 */
export function NetworkProvider({ network, children }: NetworkProviderProps) {
  const chain = useChain(network);

  const value = useMemo(
    () => ({
      network,
      chain: chain
    }),
    [network, chain]
  );

  return <NetworkContext.Provider value={value}>{children}</NetworkContext.Provider>;
}

/**
 * useNetwork - Get the current network with fallback
 *
 * Priority:
 * 1. NetworkContext (if within a NetworkProvider)
 * 2. localStorage CURRENT_NETWORK_KEY (from initMimir)
 * 3. 'polkadot' (default)
 *
 * @returns { network: string, chain: Endpoint }
 */
export function useNetwork(): NetworkContextValue {
  const context = useContext(NetworkContext);
  const fallbackNetwork = DEFAULT_NETWORK;
  const fallbackChain = useChain(fallbackNetwork);

  // If within NetworkProvider, use that
  if (context) {
    return context;
  }

  // Otherwise, use fallback from localStorage or default
  return {
    network: fallbackNetwork,
    chain: fallbackChain as Endpoint
  };
}

/**
 * useNetworkOptional - Get the current network from context (optional)
 *
 * Returns null if not within a NetworkProvider. Useful for components
 * that can work with or without a network context.
 *
 * @returns { network: string, chain: Endpoint } | null
 */
export function useNetworkOptional(): NetworkContextValue | null {
  return useContext(NetworkContext);
}
