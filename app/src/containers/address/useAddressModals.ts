// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useAccount } from '@/accounts/useAccount';
import { useWallet } from '@/wallet/useWallet';

import { useApi } from '@mimir-wallet/polkadot-core';

/**
 * Hook that determines if address-related modals should be shown
 *
 * @returns boolean indicating if address modals should be rendered
 */
export function useAddressModals(): boolean {
  const { isApiReady } = useApi();
  const { isWalletReady } = useWallet();
  const { current, isMultisigSyned } = useAccount();

  // Address modals should only show when all conditions are met:
  // - API is ready and connected
  // - Wallet is connected and ready
  // - Multisig synchronization is complete
  // - There is a current selected account
  return isApiReady && isWalletReady && isMultisigSyned && !!current;
}
