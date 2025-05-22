// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountId, AccountIndex, Address } from '@polkadot/types/interfaces';
import type { HexString } from '@polkadot/util/types';

import { encodeAddress } from './defaults.js';
import { isPolkadotAddress } from './utils.js';

function accountExplorerLink(
  chain: { explorerUrl?: string; statescanUrl?: string; ss58Format: number },
  value?: AccountId | AccountIndex | Address | HexString | Uint8Array | string | null
): string | undefined {
  const _value = encodeAddress(value, chain.ss58Format);

  if (_value && isPolkadotAddress(_value)) {
    const explorerUrl = chain.explorerUrl;

    if (explorerUrl) {
      const url = new URL(explorerUrl);

      url.pathname = `/account/${_value}`;

      return url.toString();
    }

    const statescanUrl = chain.statescanUrl;

    if (statescanUrl) {
      const url = new URL(statescanUrl);

      url.hash = `/accounts/${_value}`;

      return url.toString();
    }
  }

  return undefined;
}

function extrinsicExplorerLink(
  chain: { explorerUrl?: string; statescanUrl?: string },
  value?: string | { toString: () => string }
): string | undefined {
  const _value = value?.toString();

  const explorerUrl = chain.explorerUrl;

  if (explorerUrl) {
    const url = new URL(explorerUrl);

    url.pathname = `/extrinsic/${_value}`;

    return url.toString();
  }

  const statescanUrl = chain.statescanUrl;

  if (statescanUrl) {
    const url = new URL(statescanUrl);

    url.hash = `/extrinsics/${_value}`;

    return url.toString();
  }

  return undefined;
}

export const chainLinks = {
  accountExplorerLink,
  extrinsicExplorerLink
};
