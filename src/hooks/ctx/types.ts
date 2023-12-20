// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { TxEvents } from '@mimir-wallet/utils';
import type { SubmittableExtrinsic } from '@polkadot/api/types';
import type { AccountId, Call, Extrinsic } from '@polkadot/types/interfaces';
import type { ExtrinsicPayloadValue, IMethod, ISubmittableResult } from '@polkadot/types/types';
import type { HexString } from '@polkadot/util/types';
import type { Address } from 'cluster';
import type { Transaction } from '../types';

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
  filtered?: Filtered;
  destCall?: Call | IMethod;
  destSender?: AccountId | Address | string;
  transaction?: Transaction;
  onlySign?: boolean;
  isCancelled?: boolean;
  isApprove?: boolean;
  onRemove?: () => void;
  website?: string;
  onSignature?: (signer: string, signature: HexString, ex: Extrinsic, payload: ExtrinsicPayloadValue) => void;
  onReject?: () => void;
  onResults?: (results: ISubmittableResult) => void;
}

export type TxQueueState = Omit<Required<TxQueue>, 'filtered' | 'onResults' | 'transaction' | 'website'> & {
  transaction?: Transaction;
  filtered?: Filtered;
  website?: string;
  onResults?: (results: ISubmittableResult) => void;
};

export interface TxToast {
  id?: number;
  style?: 'notification' | 'dialog';
  onRemove?: () => void;
  onChange?: () => void;
  events: TxEvents;
}

export type TxToastState = Omit<Required<TxToast>, 'onChange'> & { onChange?: () => void };
