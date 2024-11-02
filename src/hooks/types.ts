// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { PalletAssetsAssetStatus } from '@polkadot/types/lookup';
import type { BN } from '@polkadot/util';
import type { HexString } from '@polkadot/util/types';
import type { Asset } from '@mimir-wallet/config';

export type CallParam = any;

export type CallParams = [] | CallParam[];

export interface CallOptions<T> {
  defaultValue?: T;
  paramMap?: (params: any) => CallParams;
  transform?: (value: any, api: ApiPromise) => T;
  withParams?: boolean;
  withParamsTransform?: boolean;
}

export interface CacheMultisig {
  extrinsicHash: HexString;
  genesisHash: HexString;
  creator: HexString;
  who: HexString[];
  threshold: number;
  name: string;
  pure: HexString | null;
  blockNumber: number | null;
  extrinsicIndex: number | null;
  isDone: boolean;
}

export type DelegateeProp = {
  proxyType: string;
  proxyNetwork: HexString;
  proxyDelay: number;
};

export type AccountDataExtra = {
  cryptoType?: string;
  source?: string;
  isProxied?: boolean;
  isProxy?: boolean;
  proxyType?: string;
  proxyNetwork?: HexString;
  proxyDelay?: number;
};

export type AccountDataType = {
  createdAt: number;
  address: string;
  name?: string | null;
  isMimir?: boolean;
  delegatees: (AccountData & DelegateeProp)[];
};

export type MultisigAccountData = AccountDataType & {
  type: 'multisig';
  threshold: number;
  members: AccountData[];
};

export type PureAccountData = AccountDataType & {
  type: 'pure';
  createdBlock: string;
  createdBlockHash: HexString;
  createdExtrinsicHash: HexString;
  createdExtrinsicIndex: number;
  creator: HexString;
  disambiguationIndex: number;
  network: HexString;
};

type BaseAccountData = AccountDataType & {
  type: 'account';
};

export type AccountData = MultisigAccountData | PureAccountData | BaseAccountData;

export enum TransactionStatus {
  Initialized = 0,
  Pending = 1,
  Success = 2,
  Failed = 3,
  MemberChanged = 4,
  Cancelled = 5,
  AnnounceRemoved = 6,
  AnnounceReject = 7
}

export enum TransactionType {
  Unknown = 0,
  Multisig = 1,
  Proxy = 2,
  Announce = 3
}

type BaseTransaction = {
  id: number;
  address: string;
  callHash: HexString;
  section?: string;
  method?: string;
  call?: HexString | null;
  status: TransactionStatus;
  type: TransactionType;
  createdBlock: string;
  createdBlockHash: HexString;
  createdExtrinsicIndex: number;
  createdExtrinsicHash: HexString;
  executedBlock?: string;
  executedBlockHash?: HexString;
  executedExtrinsicIndex?: number;
  executedExtrinsicHash?: HexString;
  cancelBlock?: string;
  cancelBlockHash?: HexString;
  cancelExtrinsicIndex?: number;
  cancelExtrinsicHash?: HexString;
  announceUpdateBlock?: string;
  announceUpdateBlockHash?: HexString;
  announceUpdateExtrinsicIndex?: number;
  announceUpdateExtrinsicHash?: HexString;
  createdAt: number;
  updatedAt: number;
  sendFromMimir: boolean;
  website?: string | null;
  appName?: string | null;
  iconUrl?: string | null;
  note?: string | null;
  threshold?: number;
  members?: string[];
  delegate?: string;
  children: Transaction[];
};

export type UnknownTransaction = BaseTransaction & {
  type: TransactionType.Unknown;
};

export type MultisigTransaction = BaseTransaction & {
  type: TransactionType.Multisig;
  threshold: number;
  members: HexString[];
};

export type ProxyTransaction = BaseTransaction & {
  type: TransactionType.Proxy | TransactionType.Announce;
  delegate?: HexString;
};

export type Transaction = UnknownTransaction | MultisigTransaction | ProxyTransaction;

export type HistoryTransaction = Transaction & { uuid: string };

export interface TokenInfo {
  asset_type: string;
  available_balance: string;
  bonded_locked_balance: string;
  democracy_locked_balance: string;
  display_name: string;
  election_locked_balance: string;
  free_balance: string;
  inflation: string;
  locked_balance: string;
  nominator_bonded: string;
  price: string;
  price_change: string;
  reserved_balance: string;
  symbol: string;
  token_decimals: number;
  total_issuance: string;
  unbonded_locked_balance: string;
  unique_id: string;
  validator_bonded: string;
  vesting_balance: string;
}

export type NewTxMessage = {
  uuid: string;
  action: string;
  initiator: HexString;
  blockTime: string;
  blockHeight: number;
  extrinsicIndex: number;
};

export type ApproveTxMessage = {
  uuid: string;
  action: string;
  approver: HexString;
  blockTime: string;
  blockHeight: number;
  extrinsicIndex: number;
};

export type ExecuteTxMessage = {
  uuid: string;
  action: string;
  executer: HexString;
  status: TransactionStatus;
  blockTime: string;
  blockHeight: number;
  extrinsicIndex: number;
};

export type CancelTxMessage = {
  uuid: string;
  action: string;
  canceller: HexString;
  blockTime: string;
  blockHeight: number;
  extrinsicIndex: number;
};

export interface PushMessageData {
  id: number;
  address: HexString;
  sender: HexString;
  type: 'initial' | 'approve' | 'execute' | 'cancel';
  blockHeight: number;
  extrinsicIndex: number;
  blockTime: string;
  raw: NewTxMessage | ApproveTxMessage | ExecuteTxMessage | CancelTxMessage;
  createdAt: string;
  updatedAt: string;
}

export interface AssetInfoBase {
  readonly isNative: boolean;
  // metadata
  readonly name: string;
  readonly symbol: string;
  readonly decimals: number;
}

export type AssetInfo = Asset &
  AssetInfoBase & {
    // for assets
    readonly assetsInfo?: {
      readonly owner: string;
      readonly issuer: string;
      readonly admin: string;
      readonly freezer: string;
      readonly supply: BN;
      readonly deposit: BN;
      readonly minBalance: BN;
      readonly isSufficient: boolean;
      readonly accounts: number;
      readonly sufficients: number;
      readonly approvals: number;
      readonly status: PalletAssetsAssetStatus;
    };
  };

export interface AccountBalance {
  total: BN;
  locked: BN;
  reserved: BN;
  transferrable: BN;
  bonded: BN;
  redeemable: BN;
  unbonding: BN;
}

export type AccountAssetInfo = AssetInfo & {
  balance: BN;
  account: string;
};

export interface SafetyLevel {
  severity: 'none' | 'warning' | 'error';
  title: string;
  message: string;
}

export interface AddressMeta {
  name?: string;
  cryptoType?: string;
  isMimir?: boolean;
  isPure?: boolean;
  isProxied?: boolean;
  isProxy?: boolean;
  isInjected?: boolean;
  isMultisig?: boolean;
  multipleMultisig?: boolean;
  source?: string;
  threshold?: number;
  who?: string[];
}

type MultisigFilterPath = {
  id: string;
  type: 'multisig';
  multisig: string;
  otherSignatures: string[];
  threshold: number;
  address: string;
};

type ProxyFilterPath = {
  id: string;
  type: 'proxy';
  real: string;
  proxyType: string;
  delay?: number;
  address: string;
};

type OriginFilterPath = {
  id: string;
  type: 'origin';
  address: string;
};

export type FilterPath = MultisigFilterPath | ProxyFilterPath | OriginFilterPath;

export type FilterPathWithoutId =
  | Omit<MultisigFilterPath, 'id'>
  | Omit<ProxyFilterPath, 'id'>
  | Omit<OriginFilterPath, 'id'>;

export interface BatchTxItem {
  id: number;
  calldata: HexString;
  website?: string;
  iconUrl?: string;
  appName?: string;
}
