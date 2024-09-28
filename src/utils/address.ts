// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { HexString } from '@polkadot/util/types';

import { u8aEq, u8aToHex } from '@polkadot/util';
import { decodeAddress } from '@polkadot/util-crypto';

export function addressToHex(address: string): HexString {
  return u8aToHex(decodeAddress(address));
}

export function addressEq(
  a?: string | { toString: () => string } | null,
  b?: string | { toString: () => string } | null
): boolean {
  if (!a || !b) return false;

  try {
    return u8aEq(decodeAddress(a.toString()), decodeAddress(b.toString()));
  } catch {
    return false;
  }
}
