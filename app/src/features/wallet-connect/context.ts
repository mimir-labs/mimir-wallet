// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { WalletConnectState } from './types';

import { createContext } from 'react';

// Create a more type-safe default context value
const defaultWalletConnectState: WalletConnectState = {
  web3Wallet: null as any, // Will be properly initialized by provider
  isReady: false,
  isError: false,
  sessions: [],
  sessionProposal: undefined,
  deleteProposal: () => {
    console.warn('WalletConnect context not properly initialized');
  }
};

export const WalletConnectContext = createContext<WalletConnectState>(defaultWalletConnectState);
