// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { WalletState } from './types';

import { CONNECTED_WALLETS_KEY } from '@/constants';
import { addressEq } from '@/utils/address';
import { useMemo } from 'react';
import { create } from 'zustand';

import { store } from '@mimir-wallet/service';

export const useWallet = create<WalletState>()((set) => ({
  // Initial state properties
  initialized: false, // Flag indicating if wallet system is initialized
  isWalletReady: false, // Flag indicating if wallet is ready for operations
  walletOpen: false, // Controls wallet UI visibility
  wallets: {}, // Available injected wallets
  walletAccounts: [], // List of connected wallet accounts
  connectedWallets: (store.get(CONNECTED_WALLETS_KEY) as string[]) || [], // Names of currently connected wallets

  // UI control methods
  openWallet: () => set({ walletOpen: true }),
  closeWallet: () => set({ walletOpen: false })
}));

export function useAccountSource(address?: string | null) {
  const { walletAccounts } = useWallet();

  return useMemo(
    () => (address ? walletAccounts.find((account) => addressEq(account.address, address))?.source : undefined),
    [walletAccounts, address]
  );
}

export function accountSource(address: string) {
  return useWallet.getState().walletAccounts.find((item) => item.address === address)?.source;
}
