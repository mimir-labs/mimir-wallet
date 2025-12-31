// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { TokenNetworkItem } from './types';
import type { InputNetworkTokenContextValue } from './useInputNetworkTokenContext';

import { useChain, useChains, useNetwork } from '@mimir-wallet/polkadot-core';
import React, { useCallback, useMemo, useState } from 'react';

import { InputNetworkTokenContext } from './useInputNetworkTokenContext';
import { useTokenNetworkData } from './useTokenNetworkData';
import { findItemByValue } from './utils';

import { useBalanceByIdentifier } from '@/hooks/useChainBalances';
import { useRecentNetworks } from '@/hooks/useRecentNetworks';

/**
 * Props for InputNetworkTokenProvider
 */
export interface InputNetworkTokenProviderProps {
  children: React.ReactNode;

  /** Account address for fetching balance data */
  address?: string;

  /** Default network (used when network prop is not provided) */
  defaultNetwork?: string;
  /** Default identifier */
  defaultIdentifier?: string;

  /** Default keep alive setting */
  defaultKeepAlive?: boolean;

  /** Supported networks filter - if provided, only show these networks */
  supportedNetworks?: string[];
  /** Only show networks that support XCM (have paraspellChain defined) */
  xcmOnly?: boolean;
  /** Custom filter function for tokens */
  tokenFilter?: (item: TokenNetworkItem) => boolean;
}

/**
 * Provider for InputNetworkToken context
 *
 * Manages all state and data fetching for network token selection.
 * Amount state is NOT managed here - it should be managed externally.
 *
 * @example
 * ```tsx
 * <InputNetworkTokenProvider
 *   address={current}
 *   defaultNetwork="polkadot"
 *   defaultIdentifier="native"
 * >
 *   <TransferUI />
 * </InputNetworkTokenProvider>
 * ```
 */
export function InputNetworkTokenProvider({
  children,
  address,
  defaultNetwork,
  defaultIdentifier = 'native',
  defaultKeepAlive = true,
  supportedNetworks,
  xcmOnly = false,
  tokenFilter,
}: InputNetworkTokenProviderProps) {
  // Get initial network from context
  const { network: initialNetwork } = useNetwork();
  const { enableNetwork } = useChains();

  // Store user's preferred selection (may become invalid if constraints change)
  const [preferredNetwork, setPreferredNetwork] = useState<string>(
    defaultNetwork || initialNetwork,
  );

  // Preferred identifier state
  const [preferredIdentifier, setPreferredIdentifier] =
    useState<string>(defaultIdentifier);

  // Keep alive state
  const [keepAlive, setKeepAlive] = useState(defaultKeepAlive);

  // Dialog filter state (internal, may be reset when network is forced to change)
  const [activeNetworkFilterInternal, setActiveNetworkFilterInternal] =
    useState<string | null>(null);

  // Derive effective network by validating preferredNetwork against supportedNetworks
  // This avoids the need for effect-based state correction
  const network = useMemo(() => {
    if (!supportedNetworks?.length) return preferredNetwork;

    return supportedNetworks.includes(preferredNetwork)
      ? preferredNetwork
      : supportedNetworks[0];
  }, [preferredNetwork, supportedNetworks]);

  // Derive effective identifier (reset to native when network is forced to change)
  const identifier = useMemo(() => {
    if (
      supportedNetworks?.length &&
      !supportedNetworks.includes(preferredNetwork)
    ) {
      return 'native';
    }

    return preferredIdentifier;
  }, [preferredNetwork, preferredIdentifier, supportedNetworks]);

  // Reset activeNetworkFilter when network is forced to change
  const activeNetworkFilter = useMemo(() => {
    if (
      supportedNetworks?.length &&
      activeNetworkFilterInternal &&
      !supportedNetworks.includes(activeNetworkFilterInternal)
    ) {
      return null;
    }

    return activeNetworkFilterInternal;
  }, [supportedNetworks, activeNetworkFilterInternal]);

  // Data fetching with optional network filter
  const { items, networks, isLoading, isFetched } = useTokenNetworkData(
    address,
    {
      activeNetworkFilter,
      supportedNetworks: supportedNetworks,
      xcmOnly,
      tokenFilter,
    },
  );

  // Recent networks for priority sorting
  const { addRecent } = useRecentNetworks();

  // Fallback: query balance directly when token not in items list
  const networkConfig = useChain(network);
  const [balanceData, isBalanceFetched, isBalanceFetching] =
    useBalanceByIdentifier(network, address, identifier);

  // Compute selected token from items, with fallback to direct balance query
  const token = useMemo(() => {
    // First try to find in items list
    const fromItems = findItemByValue(items, { network, identifier });

    if (fromItems) {
      return fromItems;
    }

    // Fallback: construct from direct balance query
    if (balanceData && networkConfig) {
      return {
        network: networkConfig,
        token: balanceData,
        usdValue: 0,
        key: `${network}:${identifier}`,
      };
    }

    return undefined;
  }, [items, network, identifier, balanceData, networkConfig]);

  // Token loading state (for UI display)
  const isTokenLoading = !token && !isBalanceFetched && isBalanceFetching;

  // Compute combined value
  const value = useMemo(() => {
    if (!identifier || !network) return undefined;

    return { network, identifier };
  }, [network, identifier]);

  // Setters
  const setNetwork = useCallback(
    (newNetwork: string) => {
      setPreferredNetwork(newNetwork);
      addRecent(newNetwork);
    },
    [addRecent],
  );

  const setIdentifier = useCallback((newIdentifier: string) => {
    setPreferredIdentifier(newIdentifier);
  }, []);

  // Default maxVisibleNetworks is 5 (same as InputNetworkToken default)
  const setActiveNetworkFilter = useCallback(
    (filter: string | null, maxVisibleNetworks = 5) => {
      setActiveNetworkFilterInternal(filter);

      if (filter) {
        enableNetwork(filter);
        // Only move to front if not already in visible tabs
        addRecent(filter, maxVisibleNetworks);
      }
    },
    [addRecent, enableNetwork],
  );

  const setValue = useCallback(
    (newValue: { network: string; identifier: string }) => {
      if (newValue.network !== network) {
        setNetwork(newValue.network);
      }

      setIdentifier(newValue.identifier);
    },
    [network, setNetwork, setIdentifier],
  );

  // Reset to initial state
  const reset = useCallback(() => {
    setPreferredIdentifier(defaultIdentifier);
    setKeepAlive(defaultKeepAlive);
  }, [defaultIdentifier, defaultKeepAlive]);

  const contextValue: InputNetworkTokenContextValue = {
    address,
    value,
    network,
    identifier,
    token,
    isTokenLoading,
    items,
    networks,
    isLoading,
    isFetched,
    keepAlive,
    setValue,
    setNetwork,
    setIdentifier,
    setKeepAlive,
    reset,
    activeNetworkFilter,
    setActiveNetworkFilter,
  };

  return (
    <InputNetworkTokenContext.Provider value={contextValue}>
      {children}
    </InputNetworkTokenContext.Provider>
  );
}
