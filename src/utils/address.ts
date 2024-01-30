// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountId, AccountIndex, Address } from '@polkadot/types/interfaces';
import type { KeyringItemType, KeyringJson$Meta } from '@polkadot/ui-keyring/types';
import type { HexString } from '@polkadot/util/types';

import { keyring } from '@polkadot/ui-keyring';
import { hexToU8a, isHex } from '@polkadot/util';

export interface AddressMeta extends KeyringJson$Meta {
  isMimir?: boolean;
  isConfirm?: boolean;
  isValid?: boolean;
  isFlexible?: boolean;
  creator?: string;
  height?: number;
  index?: number;
  isPending?: boolean;
}

export function getAddressMeta(address: string | Uint8Array | HexString, type: KeyringItemType | null = null): AddressMeta {
  let meta: AddressMeta | undefined;

  try {
    const pair = keyring.getAddress(isHex(address) ? hexToU8a(address) : address, type);

    meta = pair && pair.meta;
  } catch {
    // we could pass invalid addresses, so it may throw
  }

  return meta || {};
}

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
