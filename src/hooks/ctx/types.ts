// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SubmittableExtrinsic } from '@polkadot/api/types';
import type { AccountId } from '@polkadot/types/interfaces';
import type { HexString } from '@polkadot/util/types';
import type { Address } from 'cluster';

export interface Accounts {
  allAccounts: string[];
  allAccountsHex: HexString[];
  areAccountsLoaded: boolean;
  hasAccounts: boolean;
  isAccount: (address?: string | null | { toString: () => string }) => boolean;
}

export interface Addresses {
  allAddresses: string[];
  allAddressesHex: HexString[];
  areAddressesLoaded: boolean;
  hasAddresses: boolean;
  isAddress: (address?: string | null | { toString: () => string }) => boolean;
}

export interface Filtered {
  [key: string]: Filtered | undefined;
}
export interface TxQueue {
  id?: number;
  accountId: AccountId | Address | string;
  beforeSend?: () => Promise<void>;
  extrinsic: SubmittableExtrinsic<'promise'>;
  isCancelled?: boolean;
  isApprove?: boolean;
  onRemove?: () => void;
}
