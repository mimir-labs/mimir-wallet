// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { KeyringItemType, KeyringJson$Meta } from '@polkadot/ui-keyring/types';
import type { HexString } from '@polkadot/util/types';

import { keyring } from '@polkadot/ui-keyring';
import { hexToU8a, isHex } from '@polkadot/util';

export function getAddressMeta(address: string | Uint8Array | HexString, type: KeyringItemType | null = null): KeyringJson$Meta {
  let meta: KeyringJson$Meta | undefined;

  try {
    const pair = keyring.getAddress(isHex(address) ? hexToU8a(address) : address, type);

    meta = pair && pair.meta;
  } catch {
    // we could pass invalid addresses, so it may throw
  }

  return meta || {};
}
