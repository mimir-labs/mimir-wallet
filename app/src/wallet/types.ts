// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Injected } from '@polkadot/extension-inject/types';

export interface InjectedWindowProvider {
  enable: (origin: string) => Promise<Injected>;
  version: string;
}

export type WalletAccount = { address: string; name?: string; type?: string; source: string };
export interface WalletState {
  initialized: boolean;
  isWalletReady: boolean;
  walletOpen: boolean;
  wallets: Record<string, InjectedWindowProvider>;
  walletAccounts: WalletAccount[];
  connectedWallets: string[];
  openWallet: () => void;
  closeWallet: () => void;
}
