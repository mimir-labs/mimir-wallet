// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountId, AccountIndex, Address } from '@polkadot/types/interfaces';
import type { KeyringJson$Meta } from '@polkadot/ui-keyring/types';
import type { HexString } from '@polkadot/util/types';

import { keyring } from '@polkadot/ui-keyring';
import { hexToU8a, isHex, u8aToHex } from '@polkadot/util';
import { decodeAddress } from '@polkadot/util-crypto';

export interface AddressMeta extends KeyringJson$Meta {
  isMimir?: boolean;
  isFlexible?: boolean;
  creator?: string;
  height?: number;
  index?: number;
  isPending?: boolean;
}

export function getAddressMeta(address: string | Uint8Array | HexString): AddressMeta {
  let meta: AddressMeta | undefined;

  try {
    const pair =
      keyring.getAddress(isHex(address) ? hexToU8a(address) : address, 'account') ||
      keyring.getAddress(isHex(address) ? hexToU8a(address) : address, 'address');

    meta = pair && pair.meta;
  } catch {
    // we could pass invalid addresses, so it may throw
  }

  return meta || {};
}

export function getAccountCryptoType(
  accountId: AccountId | AccountIndex | Address | string | Uint8Array | null
): string {
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

export function isLocalAccount(address?: string | null | { toString: () => string }): boolean {
  return !!address && !!keyring.getAccount(address.toString());
}

export function isLocalAddress(address?: string | null | { toString: () => string }): boolean {
  return !!address && !!keyring.getAddress(address.toString(), 'address');
}

export function addressToHex(address: string): HexString {
  return u8aToHex(decodeAddress(address));
}
