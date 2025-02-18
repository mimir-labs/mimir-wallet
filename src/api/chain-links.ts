// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountId, AccountIndex, Address } from '@polkadot/types/interfaces';
import type { HexString } from '@polkadot/util/types';
import type { Endpoint } from '@mimir-wallet/config';

import { isAddress } from '@polkadot/util-crypto';

import { encodeAddress } from './defaults';

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

function subsquareUrl(chain: Endpoint, path?: string): string | undefined {
  const baseUrl = chain.subsquareUrl;

  return baseUrl ? `${baseUrl}${path || ''}` : undefined;
}

function proposalApi(chain: Endpoint): string | undefined {
  return chain.proposalApi;
}

function serviceUrl(chain: Endpoint, path: string): string {
  const url: string = chain.serviceUrl || 'http://127.0.0.1:8080/';

  return `${url}${path}`;
}

export const chainLinks = {
  accountExplorerLink,
  extrinsicExplorerLink,
  subsquareUrl,
  proposalApi,
  serviceUrl
};
