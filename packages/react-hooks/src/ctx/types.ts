// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

export interface Accounts {
  allAccounts: string[];
  allAccountsHex: string[];
  areAccountsLoaded: boolean;
  hasAccounts: boolean;
  isAccount: (address?: string | null | { toString: () => string }) => boolean;
}

export interface Addresses {
  allAddresses: string[];
  allAddressesHex: string[];
  areAddressesLoaded: boolean;
  hasAddresses: boolean;
  isAddress: (address?: string | null | { toString: () => string }) => boolean;
}
