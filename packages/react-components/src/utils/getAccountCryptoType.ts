// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountId, AccountIndex, Address } from '@polkadot/types/interfaces';

import { keyring } from '@polkadot/ui-keyring';

export function getAccountCryptoType(accountId: AccountId | AccountIndex | Address | string | Uint8Array | null): string {
  try {
    const current = accountId ? keyring.getPair(accountId.toString()) : null;

    if (current) {
      return current.meta.isInjected
        ? 'injected'
        : current.meta.isHardware
        ? (current.meta.hardwareType as string) || 'hardware'
        : current.meta.isExternal
        ? current.meta.isMultisig
          ? 'multisig'
          : current.meta.isProxied
          ? 'proxied'
          : 'qr'
        : current.type;
    }
  } catch {
    // cannot determine, keep unknown
  }

  return 'unknown';
}
