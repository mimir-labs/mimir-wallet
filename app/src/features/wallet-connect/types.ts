// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SessionTypes } from '@walletconnect/types';
import type Web3WalletType from '@walletconnect/web3wallet';
import type { Web3WalletTypes } from '@walletconnect/web3wallet';

export interface WalletConnectState {
  web3Wallet: Web3WalletType;
  isReady: boolean;
  isError: boolean;
  sessions: SessionTypes.Struct[];
  sessionProposal?: Web3WalletTypes.SessionProposal;
  deleteProposal: () => void;
}
