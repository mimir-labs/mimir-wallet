// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SlippageState } from './types';
import type {
  TokenNetworkItem,
  TokenNetworkValue,
} from '@/components/InputNetworkToken';
import type { Endpoint } from '@mimir-wallet/polkadot-core';

import { useLocalStore } from '@mimir-wallet/service';
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

import { DEFAULT_SLIPPAGE } from './types';

import {
  findItemByValue,
  InputNetworkTokenProvider,
  useInputNetworkTokenContext,
  useTokenNetworkData,
} from '@/components/InputNetworkToken';
import { CROSS_CHAIN_SWAP_SLIPPAGE_KEY } from '@/constants';
import { useInputNumber } from '@/hooks/useInputNumber';

/**
 * SwapForm context value type
 */
interface SwapFormContextValue {
  // Sender
  sending: string;

  // Supported networks (Polkadot only)
  supportedNetworks?: string[];

  // From token state (from InputNetworkTokenContext)
  fromToken: TokenNetworkItem | undefined;
  fromNetwork: string;
  setFromValue: (value: TokenNetworkValue) => void;

  // To token state
  toValue: TokenNetworkValue | undefined;
  setToValue: (value: TokenNetworkValue | undefined) => void;
  toToken: TokenNetworkItem | undefined;
  toItems: TokenNetworkItem[];
  toNetworks: Endpoint[];
  isToItemsLoading: boolean;

  // Amount
  amount: string;
  isAmountValid: boolean;
  setAmount: (amount: string) => void;

  // Slippage
  slippage: SlippageState;
  setSlippage: (slippage: SlippageState) => void;

  // Recipient
  recipient: string;
  setRecipient: (recipient: string) => void;
}

const SwapFormContext = createContext<SwapFormContextValue | null>(null);

/**
 * Inner provider that has access to InputNetworkTokenContext
 */
function SwapFormContextProvider({
  sending,
  supportedNetworks,
  children,
}: {
  sending: string;
  supportedNetworks?: string[];
  children: React.ReactNode;
}) {
  // From token state (from InputNetworkTokenContext)
  const {
    token: fromToken,
    network: fromNetwork,
    setValue: setFromValue,
  } = useInputNetworkTokenContext();

  // To token data - fetched once and shared (filtered by supportedNetworks)
  const {
    items: toItems,
    networks: toNetworks,
    isLoading: isToItemsLoading,
  } = useTokenNetworkData(sending, {
    xcmOnly: true,
    includeAllAssets: true,
    supportedNetworks,
    tokenFilter: (item) =>
      (item.token.price && item.token.price > 0) || !!item.token.logoUri,
  });

  // To token state
  const [toValue, setToValue] = useState<TokenNetworkValue | undefined>();
  const toToken = useMemo(
    () => (toValue ? findItemByValue(toItems, toValue) : undefined),
    [toItems, toValue],
  );

  // Amount state
  const [[amount, isAmountValid], setAmountState] = useInputNumber(
    '',
    false,
    0,
  );
  const setAmount = useCallback(
    (value: string) => setAmountState(value),
    [setAmountState],
  );

  // Slippage state (persisted to localStorage)
  const [slippage, setSlippage] = useLocalStore<SlippageState>(
    CROSS_CHAIN_SWAP_SLIPPAGE_KEY,
    DEFAULT_SLIPPAGE,
  );

  // Recipient state (defaults to sender address)
  const [recipient, setRecipient] = useState(sending);

  const value = useMemo<SwapFormContextValue>(
    () => ({
      sending,
      supportedNetworks,
      fromToken,
      fromNetwork,
      setFromValue,
      toValue,
      setToValue,
      toToken,
      toItems,
      toNetworks,
      isToItemsLoading,
      amount,
      isAmountValid,
      setAmount,
      slippage,
      setSlippage,
      recipient,
      setRecipient,
    }),
    [
      sending,
      supportedNetworks,
      fromToken,
      fromNetwork,
      setFromValue,
      toValue,
      toToken,
      toItems,
      toNetworks,
      isToItemsLoading,
      amount,
      isAmountValid,
      setAmount,
      slippage,
      setSlippage,
      recipient,
    ],
  );

  return (
    <SwapFormContext.Provider value={value}>
      {children}
    </SwapFormContext.Provider>
  );
}

interface SwapFormProviderProps {
  address: string;
  supportedNetworks?: string[];
  defaultNetwork?: string;
  children: React.ReactNode;
}

/**
 * Provider for swap form state
 * Wraps InputNetworkTokenProvider and manages all swap form state
 */
export function SwapFormProvider({
  address,
  supportedNetworks,
  defaultNetwork,
  children,
}: SwapFormProviderProps) {
  return (
    <InputNetworkTokenProvider
      address={address}
      defaultNetwork={defaultNetwork}
      supportedNetworks={supportedNetworks}
      xcmOnly
    >
      <SwapFormContextProvider
        sending={address}
        supportedNetworks={supportedNetworks}
      >
        {children}
      </SwapFormContextProvider>
    </InputNetworkTokenProvider>
  );
}

/**
 * Hook to access swap form context
 * Must be used within SwapFormProvider
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useSwapFormContext(): SwapFormContextValue {
  const context = useContext(SwapFormContext);

  if (!context) {
    throw new Error('useSwapFormContext must be used within SwapFormProvider');
  }

  return context;
}
