// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { TokenNetworkItem, TokenNetworkValue } from './types';
import type { Endpoint } from '@mimir-wallet/polkadot-core';

import { createContext, useCallback, useContext } from 'react';

import { itemToValue } from './utils';

/**
 * Context value provided by InputTokenAmountProvider
 */
export interface InputTokenAmountContextValue {
  // Address for data fetching
  address?: string;

  // Core state
  value: TokenNetworkValue | undefined;
  amount: string;
  isAmountValid: boolean;
  network: string;
  identifier: string;

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
  setAmount: (amount: string) => void;
  setNetwork: (network: string) => void;
  setIdentifier: (identifier: string) => void;
  setKeepAlive: (keepAlive: boolean) => void;
  setMax: () => void;
  reset: () => void;

  // Dialog state (for InputTokenAmount component)
  activeNetworkFilter: string | null;
  setActiveNetworkFilter: (
    network: string | null,
    maxVisibleNetworks?: number,
  ) => void;
}

export const InputTokenAmountContext =
  createContext<InputTokenAmountContextValue | null>(null);

/**
 * Hook to access InputTokenAmount context
 *
 * Must be used within InputTokenAmountProvider
 *
 * @throws Error if used outside of provider
 */
export function useInputTokenAmountContext(): InputTokenAmountContextValue {
  const context = useContext(InputTokenAmountContext);

  if (!context) {
    throw new Error(
      'useInputTokenAmountContext must be used within InputTokenAmountProvider',
    );
  }

  return context;
}

/**
 * Optional hook to access InputTokenAmount context
 *
 * Returns null if used outside of provider (for backward compatibility)
 */
export function useInputTokenAmountContextOptional(): InputTokenAmountContextValue | null {
  return useContext(InputTokenAmountContext);
}

/**
 * Hook to select token from context
 *
 * Handles token selection and amount reset
 */
export function useTokenSelect(): (item: TokenNetworkItem) => void {
  const { setValue } = useInputTokenAmountContext();

  return useCallback(
    (item: TokenNetworkItem) => {
      setValue(itemToValue(item));
    },
    [setValue],
  );
}
