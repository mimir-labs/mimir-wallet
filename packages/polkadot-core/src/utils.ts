// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { HexString } from '@polkadot/util/types';

import { isU8a, u8aEq, u8aToHex } from '@polkadot/util';
import { decodeAddress } from '@polkadot/util-crypto';

export function addressToHex(address: string): HexString {
  return u8aToHex(decodeAddress(address));
}

export function addressEq(
  a?: string | HexString | Uint8Array | { toString: () => string } | null,
  b?: string | HexString | Uint8Array | { toString: () => string } | null
): boolean {
  if (!(a && b)) return false;

  try {
    return u8aEq(isU8a(a) ? a : decodeAddress(a.toString()), isU8a(b) ? b : decodeAddress(b.toString()));
  } catch {
    return false;
  }
}
