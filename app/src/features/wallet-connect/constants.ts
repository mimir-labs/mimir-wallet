// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Web3WalletTypes } from '@walletconnect/web3wallet';

export const MIMIR_WALLET_METADATA = {
  name: 'Mimir Wallet',
  description:
    'The best enterprise-level multi-signature account (multisig) management tool in Polkadot, Kusama, and other substrate-based chains. Mimir supports advanced multisig account composition and nesting. Mimir supports flexible member and threshold management. Direct interaction with third-party applications',
  url: 'https://app.mimir.global',
  icons: ['https://app.mimir.global/icons/icon@256.png']
};

export const SESSION_ADD_EVENT = 'session_add' as Web3WalletTypes.Event;
export const SESSION_REJECT_EVENT = 'session_reject' as Web3WalletTypes.Event;

export const PolkadotMethods = {
  signTransaction: 'polkadot_signTransaction',
  signMessage: 'polkadot_signMessage'
};
