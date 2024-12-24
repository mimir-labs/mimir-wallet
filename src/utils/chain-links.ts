// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountId, AccountIndex, Address } from '@polkadot/types/interfaces';
import type { HexString } from '@polkadot/util/types';

import { isAddress } from '@polkadot/util-crypto';

import { encodeAddress } from '@mimir-wallet/api';

export function accountExplorerLink(
  value?: AccountId | AccountIndex | Address | HexString | string | null
): string | undefined {
  const _value = value?.toString();

  if (_value && isAddress(_value)) {
    const explorerUrl = window.currentChain.explorerUrl;
    const isStatescan = window.currentChain.statescan;

    if (explorerUrl) {
      return isStatescan
        ? `${explorerUrl}/#/accounts/${encodeAddress(_value)}`
        : `${explorerUrl}account/${encodeAddress(_value)}`;
    }
  }

  return undefined;
}

export function extrinsicExplorerLink(value?: string | { toString: () => string }): string | undefined {
  const _value = value?.toString();

  const explorerUrl = window.currentChain.explorerUrl;
  const isStatescan = window.currentChain.statescan;

  if (explorerUrl) {
    return isStatescan ? `${explorerUrl}/#/extrinsics/${_value}` : `${explorerUrl}extrinsic/${_value}`;
  }

  return undefined;
}

export function subsquareUrl(path?: string): string | undefined {
  const baseUrl = window.currentChain.subsquareUrl;

  return baseUrl ? `${baseUrl}${path || ''}` : undefined;
}

export function proposalApi(): string | undefined {
  return window.currentChain.proposalApi;
}

export function serviceUrl(path: string): string {
  const url: string = window.currentChain.serviceUrl || 'http://127.0.0.1:8080/';

  return `${url}${path}`;
}
