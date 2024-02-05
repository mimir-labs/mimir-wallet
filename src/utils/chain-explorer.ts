// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountId, AccountIndex, Address } from '@polkadot/types/interfaces';
import type { HexString } from '@polkadot/util/types';

import { api } from '@mimir-wallet/api';
import { allEndpoints } from '@mimir-wallet/config';
import { encodeAddress, isAddress } from '@polkadot/util-crypto';

export function accountHref(value?: AccountId | AccountIndex | Address | HexString | string | null): string | undefined {
  const _value = value?.toString();

  if (_value && _value.length > 47 && isAddress(_value)) {
    const explorerUrl = allEndpoints.find((item) => item.genesisHash === api.genesisHash.toHex())?.explorerUrl;

    if (explorerUrl) {
      return `${explorerUrl}account/${encodeAddress(_value, api.registry.chainSS58)}`;
    }
  }

  return undefined;
}
