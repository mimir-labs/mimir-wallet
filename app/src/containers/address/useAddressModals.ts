// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useAccount } from '@/accounts/useAccount';
import { useWallet } from '@/wallet/useWallet';

/**
 * Hook that determines if address-related modals should be shown
 *
 * @returns boolean indicating if address modals should be rendered
 */
export function useAddressModals(): boolean {
  const { isWalletReady } = useWallet();
  const { current, isMultisigSyned } = useAccount();

  // Address modals should only show when all conditions are met:
  // - Wallet is connected and ready
  // - Multisig synchronization is complete
  // - There is a current selected account
  // Note: isApiReady check removed - ApiManager.getApi() handles API readiness internally
  return isWalletReady && isMultisigSyned && !!current;
}
