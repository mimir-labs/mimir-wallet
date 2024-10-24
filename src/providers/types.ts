// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SubmittableExtrinsic } from '@polkadot/api/types';
import type { Injected } from '@polkadot/extension-inject/types';
import type { AccountId, Address, Extrinsic } from '@polkadot/types/interfaces';
import type { ExtrinsicPayloadValue, IMethod, ISubmittableResult } from '@polkadot/types/types';
import type { HexString } from '@polkadot/util/types';
import type { TxEvents } from '@mimir-wallet/api';
import type { AccountData, AccountDataExtra, AddressMeta, FilterPath, Transaction } from '../hooks/types';

export interface Filtered {
  [key: string]: Filtered | undefined;
}
export interface TxQueue {
  id?: number;
  accountId?: AccountId | Address | string;
  call: IMethod;
  filterPaths?: FilterPath[];
  transaction?: Transaction;
  onlySign?: boolean;
  website?: string;
  iconUrl?: string;
  appName?: string;
  onReject?: () => void;
  onClose?: () => void;
  onError?: (error: unknown) => void;
  onResults?: (results: ISubmittableResult) => void;
  onFinalized?: (results: ISubmittableResult) => void;
  onSignature?: (signer: string, signature: HexString, tx: Extrinsic, payload: ExtrinsicPayloadValue) => void;
  beforeSend?: (extrinsic: SubmittableExtrinsic<'promise'>) => Promise<void>;
}

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
export type WalletAccount = { address: string; name?: string; type?: string; source: string };
export interface WalletState {
  initialized: boolean;
  isWalletReady: boolean;
  walletOpen: boolean;
  wallets: Record<string, InjectedWindowProvider>;
  walletAccounts: WalletAccount[];
  connectedWallets: string[];
  openWallet: () => void;
  closeWallet: () => void;
  connect: (name: string) => Promise<void>;
  disconnect: (name: string) => void;
  accountSource: (address: string) => string | undefined;
}

export interface AddressState {
  accounts: (AccountDataExtra & AccountData)[];
  addresses: { address: string; name: string; watchlist?: boolean }[];
  current?: string;
  isMultisigSyned: boolean;
  switchAddress?: string;
  metas: Record<string, AddressMeta>;
  resync: () => void;
  appendMeta: (meta: Record<string, AddressMeta>) => void;
  setCurrent: (address: string, confirm?: boolean) => void;
  setAccountName: (address: string, name: string) => void;
  addAddress: (address: string, name: string, watchlist?: boolean, genesisHash?: HexString) => void;
  addAddressBook: (
    address?: string,
    watchlist?: boolean,
    onAdded?: (address: string) => void,
    onClose?: () => void
  ) => void;
  deleteAddress: (address: string) => void;
  isLocalAccount: (address: string) => boolean;
  isLocalAddress: (address: string, watchlist?: boolean) => boolean;
}
