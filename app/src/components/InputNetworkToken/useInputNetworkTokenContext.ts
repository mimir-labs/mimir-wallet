// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { TokenNetworkItem, TokenNetworkValue } from './types';
import type { Endpoint } from '@mimir-wallet/polkadot-core';

import { createContext, useCallback, useContext } from 'react';

import { itemToValue } from './utils';

/**
 * Context value provided by InputNetworkTokenProvider
 */
export interface InputNetworkTokenContextValue {
  // Address for data fetching
  address?: string;

  // Core state
  value: TokenNetworkValue | undefined;
  network: string;
  identifier: string | undefined;

  // Fetched data (from useTokenNetworkData)
  token: TokenNetworkItem | undefined;
  /** Whether token data is being loaded (for fallback query) */
  isTokenLoading: boolean;
  items: TokenNetworkItem[];
  networks: Endpoint[];
  isLoading: boolean;
  isFetched: boolean;

  // Configuration
  keepAlive: boolean;

  // State setters
  setValue: (value: TokenNetworkValue) => void;
  setNetwork: (network: string) => void;
  setIdentifier: (identifier: string) => void;
  setKeepAlive: (keepAlive: boolean) => void;
  reset: () => void;

  // Dialog state (for InputNetworkToken component)
  activeNetworkFilter: string | null;
  setActiveNetworkFilter: (
    network: string | null,
    maxVisibleNetworks?: number,
  ) => void;
}

export const InputNetworkTokenContext =
  createContext<InputNetworkTokenContextValue | null>(null);

/**
 * Hook to access InputNetworkToken context
 *
 * Must be used within InputNetworkTokenProvider
 *
 * @throws Error if used outside of provider
 */
export function useInputNetworkTokenContext(): InputNetworkTokenContextValue {
  const context = useContext(InputNetworkTokenContext);

  if (!context) {
    throw new Error(
      'useInputNetworkTokenContext must be used within InputNetworkTokenProvider',
    );
  }

  return context;
}

/**
 * Optional hook to access InputNetworkToken context
 *
 * Returns null if used outside of provider (for backward compatibility)
 */
export function useInputNetworkTokenContextOptional(): InputNetworkTokenContextValue | null {
  return useContext(InputNetworkTokenContext);
}

/**
 * Hook to select token from context
 *
 * Handles token selection
 */
export function useTokenSelect(): (item: TokenNetworkItem) => void {
  const { setValue } = useInputNetworkTokenContext();

  return useCallback(
    (item: TokenNetworkItem) => {
      setValue(itemToValue(item));
    },
    [setValue],
  );
}
