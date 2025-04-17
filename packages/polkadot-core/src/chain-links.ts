// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountId, AccountIndex, Address } from '@polkadot/types/interfaces';
import type { HexString } from '@polkadot/util/types';
import type { Endpoint } from './types.js';

import { isAddress } from '@polkadot/util-crypto';

import { encodeAddress } from './defaults.js';

function accountExplorerLink(
  chain: Endpoint,
  value?: AccountId | AccountIndex | Address | HexString | Uint8Array | string | null
): string | undefined {
  const _value = encodeAddress(value, chain.ss58Format);

  if (_value && isAddress(_value)) {
    const explorerUrl = chain.explorerUrl;
    const isStatescan = chain.statescan;

    if (explorerUrl) {
      return isStatescan ? `${explorerUrl}/#/accounts/${_value}` : `${explorerUrl}account/${_value}`;
    }
  }

  return undefined;
}

function extrinsicExplorerLink(chain: Endpoint, value?: string | { toString: () => string }): string | undefined {
  const _value = value?.toString();

  const explorerUrl = chain.explorerUrl;
  const isStatescan = chain.statescan;

  if (explorerUrl) {
    return isStatescan ? `${explorerUrl}/#/extrinsics/${_value}` : `${explorerUrl}extrinsic/${_value}`;
  }

  return undefined;
}

export const chainLinks = {
  accountExplorerLink,
  extrinsicExplorerLink
};
