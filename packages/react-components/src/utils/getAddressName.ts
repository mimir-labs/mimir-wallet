// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { KeyringItemType } from '@polkadot/ui-keyring/types';

import { getAddressMeta } from './getAddressMeta';

export function getAddressName(address: string, type: KeyringItemType | null = null, defaultName?: string): [isAddress: boolean, isDefault: boolean, name: string] {
  const meta = getAddressMeta(address, type);

  return meta.name ? [false, false, meta.name.toString()] : defaultName ? [false, true, defaultName.toString()] : [true, false, address]; // toShortAddress(address)];
}
