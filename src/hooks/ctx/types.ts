// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SubmittableExtrinsic } from '@polkadot/api/types';
import type { Injected } from '@polkadot/extension-inject/types';
import type { AccountId, Call, Extrinsic } from '@polkadot/types/interfaces';
import type { ExtrinsicPayloadValue, IMethod, ISubmittableResult } from '@polkadot/types/types';
import type { HexString } from '@polkadot/util/types';
import type { Address } from 'cluster';
import type { TxEvents } from '@mimir-wallet/utils';
import type { Transaction } from '../types';

export interface Accounts {
  allAccounts: string[];
  allAccountsHex: HexString[];
  areAccountsLoaded: boolean;
  hasAccounts: boolean;
}

export interface Addresses {
  allAddresses: string[];
  allAddressesHex: HexString[];
  areAddressesLoaded: boolean;
  hasAddresses: boolean;
}

export interface Filtered {
  [key: string]: Filtered | undefined;
}
export interface TxQueue {
  id?: number;
  accountId: AccountId | Address | string;
  accounts?: [string, ...string[]];
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
  onFinalized?: (results: ISubmittableResult) => void;
  onError?: (error: unknown) => void;
}

export type TxQueueState = Omit<
  Required<TxQueue>,
  'filtered' | 'onResults' | 'onFinalized' | 'transaction' | 'website'
> & {
  transaction?: Transaction;
  filtered?: Filtered;
  website?: string;
  onResults?: (results: ISubmittableResult) => void;
  onFinalized?: (results: ISubmittableResult) => void;
};

export interface TxToast {
  id?: number;
  style?: 'notification' | 'dialog';
  onRemove?: () => void;
  onChange?: () => void;
  events: TxEvents;
}

export type TxToastState = Omit<Required<TxToast>, 'onChange'> & { onChange?: () => void };

export interface InjectedWindowProvider {
  enable: (origin: string) => Promise<Injected>;
  version: string;
}
export interface WalletState {
  isWalletReady: boolean;
  isMultisigSyned: boolean;
  walletOpen: boolean;
  wallets: Record<string, InjectedWindowProvider>;
  connectedWallets: string[];
  openWallet: () => void;
  closeWallet: () => void;
  connect: (name: string) => Promise<void>;
  disconnect: (name: string) => void;
}
