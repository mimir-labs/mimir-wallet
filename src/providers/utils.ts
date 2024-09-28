// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountData, AccountDataExtra, AddressMeta } from '../hooks/types';

import { encodeAddress } from '@mimir-wallet/api';
import { addressEq } from '@mimir-wallet/utils';

let allAccounts: (AccountDataExtra & AccountData)[] = [];
let allAddresses: { address: string; name: string }[] = [];

export function _setAllAccounts(value: (AccountDataExtra & AccountData)[]) {
  allAccounts = value;
}

export function _setAllAddresses(value: { address: string; name: string }[]) {
  allAddresses = value;
}

export function deriveAddressMeta(
  account?: AccountDataExtra & AccountData,
  address?: { name: string; address: string },
  value?: string | null
): AddressMeta {
  if (!value) {
    return {
      name: 'Empty',
      isPure: false,
      isMimir: false,
      isProxied: false,
      isProxy: false,
      isInjected: false,
      isMultisig: false
    };
  }

  value = encodeAddress(value);
  const name = address?.name || account?.name || value.slice(0, 8).toUpperCase();

  if (account) {
    return {
      name,
      cryptoType: account.cryptoType,
      isMimir: !!account.isMimir,
      isPure: account.type === 'pure',
      isProxied: !!account.isProxied,
      isProxy: !!account.isProxy,
      isInjected: !!account.source,
      isMultisig: account.type === 'multisig',
      source: account.source,
      threshold: account.type === 'multisig' ? account.threshold : undefined,
      who: account.type === 'multisig' ? account.members.map((item) => item.address) : undefined
    };
  }

  if (address) {
    return {
      name,
      isMimir: false,
      isPure: false,
      isProxied: false,
      isProxy: false,
      isInjected: false,
      isMultisig: false
    };
  }

  return {
    name,
    isMimir: false,
    isPure: false,
    isProxied: false,
    isProxy: false,
    isInjected: false,
    isMultisig: false
  };
}

export function getAddressMeta(value?: string | null): AddressMeta {
  const account = allAccounts.find((item) => addressEq(item.address, value));
  const address = allAddresses.find((item) => addressEq(item.address, value));

  return deriveAddressMeta(account, address, value);
}
