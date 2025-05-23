// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Call as ICall } from '@polkadot/types/interfaces';
import type { IMethod, Registry } from '@polkadot/types/types';
import type { HexString } from '@polkadot/util/types';

import { isHex, isU8a, u8aEq, u8aToHex, u8aToU8a } from '@polkadot/util';
import { decodeAddress, validateAddress } from '@polkadot/util-crypto';

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

export function findAction(registry: Registry, call: IMethod | ICall): [string, string] | null {
  try {
    const callFunc = registry.findMetaCall(call.callIndex);

    return [callFunc.section, callFunc.method];
  } catch {
    return null;
  }
}

export function isPolkadotAddress(address?: string | null): boolean {
  try {
    if (isHex(address)) {
      return u8aToU8a(address).length === 32;
    }

    return validateAddress(address);
  } catch {
    return false;
  }
}
