// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { InputTokenAmountContextValue } from './useInputTokenAmountContext';

import { useChain, useChains, useNetwork } from '@mimir-wallet/polkadot-core';
import React, { useCallback, useMemo, useState } from 'react';

import { InputTokenAmountContext } from './useInputTokenAmountContext';
import { useTokenNetworkData } from './useTokenNetworkData';
import { findItemByValue } from './utils';

import { useBalanceByIdentifier } from '@/hooks/useChainBalances';
import { useInputNumber } from '@/hooks/useInputNumber';
import { useRecentNetworks } from '@/hooks/useRecentNetworks';
import { formatUnits } from '@/utils';

/**
 * Props for InputTokenAmountProvider
 */
export interface InputTokenAmountProviderProps {
  children: React.ReactNode;

  /** Account address for fetching balance data */
  address?: string;

  /** Default network */
  defaultNetwork?: string;
  /** Default identifier */
  defaultIdentifier?: string;

  /** Minimum amount for validation */
  minAmount?: number;
  /** Include tokens with zero balance */
  includeZeroBalance?: boolean;
  /** Default keep alive setting */
  defaultKeepAlive?: boolean;
}

/**
 * Provider for InputTokenAmount context
 *
 * Manages all state and data fetching for token amount input.
 * All networks are supported by default.
 *
 * @example
 * ```tsx
 * <InputTokenAmountProvider
 *   address={current}
 *   defaultNetwork="polkadot"
 *   defaultIdentifier="native"
 * >
 *   <TransferUI />
 * </InputTokenAmountProvider>
 * ```
 */
export function InputTokenAmountProvider({
  children,
  address,
  defaultNetwork,
  defaultIdentifier = 'native',
  minAmount = 0,
  includeZeroBalance = false,
  defaultKeepAlive = true,
}: InputTokenAmountProviderProps) {
  // Get initial network from context
  const { network: initialNetwork } = useNetwork();
  const { enableNetwork } = useChains();

  // Network state (simple useState, supports all networks)
  const [network, setNetworkInternal] = useState<string>(
    defaultNetwork || initialNetwork,
  );

  // Amount state with validation
  const [[amount, isAmountValid], setAmountInternal] = useInputNumber(
    '',
    false,
    minAmount,
  );

  // Identifier state
  const [identifier, setIdentifierInternal] =
    useState<string>(defaultIdentifier);

  // Keep alive state
  const [keepAlive, setKeepAlive] = useState(defaultKeepAlive);

  // Dialog filter state
  const [activeNetworkFilter, setActiveNetworkFilterInternal] = useState<
    string | null
  >(null);

  // Data fetching (no supportedNetworks filter, all networks supported)
  const { items, networks, isLoading, isFetched } = useTokenNetworkData(
    address,
    { includeZeroBalance, activeNetworkFilter },
  );

  // Recent networks for priority sorting
  const { addRecent } = useRecentNetworks();

  // Fallback: query balance directly when token not in items list
  // (e.g., when token has zero balance and includeZeroBalance is false)
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
      setNetworkInternal(newNetwork);
      addRecent(newNetwork);
    },
    [addRecent],
  );

  const setIdentifier = useCallback((newIdentifier: string) => {
    setIdentifierInternal(newIdentifier);
  }, []);

  // Default maxVisibleNetworks is 5 (same as InputTokenAmount default)
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
      // Reset amount when token changes
      setAmountInternal('');
    },
    [network, setNetwork, setIdentifier, setAmountInternal],
  );

  const setAmount = useCallback(
    (newAmount: string) => {
      setAmountInternal(newAmount);
    },
    [setAmountInternal],
  );

  // Set max amount based on selected token
  const setMax = useCallback(() => {
    if (!token) return;

    const { token: tokenData } = token;
    const existentialDeposit = tokenData.existentialDeposit
      ? BigInt(tokenData.existentialDeposit)
      : 0n;

    let maxAmount = tokenData.transferrable;

    // Subtract existential deposit if keepAlive is enabled for native token
    if (keepAlive && tokenData.isNative && maxAmount > existentialDeposit) {
      maxAmount = maxAmount - existentialDeposit;
    }

    const formatted = formatUnits(maxAmount, tokenData.decimals);

    setAmountInternal(formatted);
  }, [token, keepAlive, setAmountInternal]);

  // Reset to initial state
  const reset = useCallback(() => {
    setIdentifier(defaultIdentifier);
    setAmountInternal('');
    setKeepAlive(defaultKeepAlive);
  }, [defaultIdentifier, defaultKeepAlive, setIdentifier, setAmountInternal]);

  const contextValue: InputTokenAmountContextValue = {
    address,
    value,
    amount,
    isAmountValid,
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
    setAmount,
    setNetwork,
    setIdentifier,
    setKeepAlive,
    setMax,
    reset,
    activeNetworkFilter,
    setActiveNetworkFilter,
  };

  return (
    <InputTokenAmountContext.Provider value={contextValue}>
      {children}
    </InputTokenAmountContext.Provider>
  );
}
