// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountId, AccountIndex, Address } from '@polkadot/types/interfaces';
import type { HexString } from '@polkadot/util/types';

import { isAddress } from '@polkadot/util-crypto';

import { encodeAddress, statics } from './defaults.js';

function accountExplorerLink(
  value?: AccountId | AccountIndex | Address | HexString | Uint8Array | string | null
): string | undefined {
  const _value = encodeAddress(value);

  if (_value && isAddress(_value)) {
    const explorerUrl = statics.chain.explorerUrl;
    const isStatescan = statics.chain.statescan;

    if (explorerUrl) {
      return isStatescan ? `${explorerUrl}/#/accounts/${_value}` : `${explorerUrl}account/${_value}`;
    }
  }

  return undefined;
}

function extrinsicExplorerLink(value?: string | { toString: () => string }): string | undefined {
  const _value = value?.toString();

  const explorerUrl = statics.chain.explorerUrl;
  const isStatescan = statics.chain.statescan;

  if (explorerUrl) {
    return isStatescan ? `${explorerUrl}/#/extrinsics/${_value}` : `${explorerUrl}extrinsic/${_value}`;
  }

  return undefined;
}

function subsquareUrl(path?: string): string | undefined {
  const baseUrl = statics.chain.subsquareUrl;

  return baseUrl ? `${baseUrl}${path || ''}` : undefined;
}

function proposalApi(): string | undefined {
  return statics.chain.proposalApi;
}

export const chainLinks = {
  accountExplorerLink,
  extrinsicExplorerLink,
  subsquareUrl,
  proposalApi
};
