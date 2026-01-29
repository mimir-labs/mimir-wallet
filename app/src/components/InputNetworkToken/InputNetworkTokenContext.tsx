// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { TokenNetworkItem, TokenNetworkValue } from './types';
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

  /** Default network (used in uncontrolled mode) */
  defaultNetwork?: string;
  /** Default identifier (used in uncontrolled mode) */
  defaultIdentifier?: string;

  /**
   * Controlled value - if provided, component becomes controlled
   * When controlled, internal state syncs with this value
   */
  value?: TokenNetworkValue;
  /**
   * Callback when value changes (works in both controlled and uncontrolled modes)
   */
  onChange?: (value: TokenNetworkValue) => void;

  /** Default keep alive setting */
  defaultKeepAlive?: boolean;

  /** Supported networks filter - if provided, only show these networks */
  supportedNetworks?: string[];
  /** Only show networks that support XCM (have paraspellChain defined) */
  xcmOnly?: boolean;
  /** Custom filter function for tokens */
  tokenFilter?: (item: TokenNetworkItem) => boolean;
  /** Include all assets without balance query (for destination token selection) */
  includeAllAssets?: boolean;
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
  defaultIdentifier,
  value: controlledValue,
  onChange,
  defaultKeepAlive = true,
  supportedNetworks,
  xcmOnly = false,
  tokenFilter,
  includeAllAssets = false,
}: InputNetworkTokenProviderProps) {
  // Get initial network from context
  const { network: initialNetwork } = useNetwork();
  const { enableNetwork } = useChains();

  // Internal state for uncontrolled mode
  const [internalNetwork, setInternalNetwork] = useState<string>(
    defaultNetwork || initialNetwork,
  );
  const [internalIdentifier, setInternalIdentifier] = useState<
    string | undefined
  >(defaultIdentifier);

  // Derive effective preferred values: use controlled value if provided, otherwise internal state
  const preferredNetwork = controlledValue?.network ?? internalNetwork;
  const preferredIdentifier = controlledValue?.identifier ?? internalIdentifier;

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
      includeAllAssets,
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
    // If no identifier selected, no token
    if (!identifier) {
      return undefined;
    }

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

  // Setters - update internal state only (onChange is called in setValue)
  const setNetwork = useCallback(
    (newNetwork: string) => {
      setInternalNetwork(newNetwork);
      addRecent(newNetwork);
    },
    [addRecent],
  );

  const setIdentifier = useCallback((newIdentifier: string) => {
    setInternalIdentifier(newIdentifier);
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

  // Main setter - updates internal state and notifies onChange
  const setValue = useCallback(
    (newValue: { network: string; identifier: string }) => {
      // Update internal state
      if (newValue.network !== internalNetwork) {
        setNetwork(newValue.network);
      }

      if (newValue.identifier !== internalIdentifier) {
        setIdentifier(newValue.identifier);
      }

      // Notify onChange (single call with complete value)
      onChange?.(newValue);
    },
    [internalNetwork, internalIdentifier, setNetwork, setIdentifier, onChange],
  );

  // Reset to initial state
  const reset = useCallback(() => {
    setInternalIdentifier(defaultIdentifier);
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
