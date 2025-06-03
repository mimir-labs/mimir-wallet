// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Call as ICall } from '@polkadot/types/interfaces';
import type { IMethod, Registry } from '@polkadot/types/types';
import type { HexString } from '@polkadot/util/types';

import { hexToU8a, isHex, isU8a, u8aEq, u8aToHex, u8aToU8a } from '@polkadot/util';
import {
  decodeAddress,
  encodeAddress,
  ethereumEncode,
  isEthereumAddress,
  keccak256AsU8a,
  validateAddress
} from '@polkadot/util-crypto';

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

export function isPolkadotEvmAddress(address?: string | null): boolean {
  if (!isPolkadotAddress(address)) {
    return false;
  }

  try {
    return u8aToHex(decodeAddress(address).slice(20)) === '0xeeeeeeeeeeeeeeeeeeeeeeee';
  } catch {
    return false;
  }
}

export function isEthAddress(address?: string | undefined | null): boolean {
  return address ? isEthereumAddress(address) : false;
}

export function evm2Ss58(address: string | undefined | null, ss58Format: number): string {
  if (!address) {
    return '';
  }

  if (!isEthAddress(address)) {
    throw new Error('Invalid EVM address');
  }

  const ethBytes = hexToU8a(address);
  // Create Substrate address with all `0xee`.
  const substrateBytes = new Uint8Array(32).fill(0xee);

  // Copy the Ethereum bytes into the first 20 bytes
  substrateBytes.set(ethBytes, 0);

  return encodeAddress(substrateBytes, ss58Format);
}

export function sub2Eth(address: string | undefined | null) {
  // Decode the Substrate address into raw bytes.
  const substrateBytes = decodeAddress(address);

  // if last 12 bytes are all `0xEE`,
  // we just strip the 0xEE suffix to get the original address
  if (substrateBytes.slice(20).every((b) => b === 0xee)) {
    return ethereumEncode(u8aToHex(substrateBytes.slice(0, 20)));
  }

  // this is an (ed|sr)25510 derived address
  // We Hash it with keccak_256 and take the last 20 bytes
  const ethBytes = keccak256AsU8a(substrateBytes).slice(-20);

  // Convert to Ethereum address.
  const ethAddress = ethereumEncode(ethBytes);

  return ethAddress;
}

// check the address is valid
// if polkavm is true, check the address is valid for ethereum address
export function isValidAddress(address?: string, polkavm: boolean = false) {
  return isPolkadotAddress(address) || (polkavm ? isEthAddress(address) : false);
}
