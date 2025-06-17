// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { Bytes, Option, Struct, u8, u128 } from '@polkadot/types';
import type { HexString } from '@polkadot/util/types';

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
  multisigName?: string | null;
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
  isRemoteProxy?: boolean;
};

export type AccountDataType = {
  createdAt: number;
  address: string;
  name?: string | null;
  isMimir?: boolean;
  delegatees: (AccountData & DelegateeProp)[];
  proposers?: { proposer: string; creator: string; createdAt: string; network: HexString }[];
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
  Announce = 3,
  Propose = 4
}

type BaseTransaction = {
  network: string;
  id: number;
  address: string;
  callHash: HexString;
  section?: string;
  method?: string;
  call?: HexString | null;
  status: TransactionStatus;
  type: TransactionType;
  createdBlock?: string;
  createdBlockHash?: HexString;
  createdExtrinsicIndex?: number;
  createdExtrinsicHash?: HexString;
  exector?: HexString;
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
  proposer?: string;
  children: Transaction[];
};

export type UnknownTransaction = BaseTransaction & {
  type: TransactionType.Unknown;
  createdBlock: string;
  createdBlockHash: HexString;
  createdExtrinsicIndex: number;
  createdExtrinsicHash: HexString;
};

export type MultisigTransaction = BaseTransaction & {
  type: TransactionType.Multisig;
  createdBlock: string;
  createdBlockHash: HexString;
  createdExtrinsicIndex: number;
  createdExtrinsicHash: HexString;
  threshold: number;
  members: HexString[];
};

export type ProxyTransaction = BaseTransaction & {
  type: TransactionType.Proxy | TransactionType.Announce;
  createdBlock: string;
  createdBlockHash: HexString;
  createdExtrinsicIndex: number;
  createdExtrinsicHash: HexString;
  delegate?: HexString;
  isRemoteProxy?: boolean;
};

export type ProposeTransaction = BaseTransaction & {
  type: TransactionType.Propose;
  proposer: string;
};

export type Transaction = UnknownTransaction | MultisigTransaction | ProxyTransaction | ProposeTransaction;

export type HistoryTransaction = Transaction & { uuid: string };

export interface TokenInfo {
  detail: Record<
    string,
    {
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
  >;
  token: string[];
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

export type AssetInfo<T extends boolean = boolean> = {
  readonly network: string;
  readonly name: string;
  readonly symbol: string;
  readonly decimals: number;
  readonly price?: number;
  readonly change24h?: number;
  readonly icon?: string;
} & (T extends false
  ? {
      readonly isNative: false;
      readonly assetId: string;
    }
  : {
      readonly isNative: true;
      readonly assetId: 'native';
    });

export type AccountAssetInfo<T extends boolean = boolean> = AssetInfo<T> & {
  total: bigint;
  locked: bigint;
  reserved: bigint;
  free: bigint;
  transferrable: bigint;
  account: string;
};

export interface SafetyLevel {
  severity: 'none' | 'warning' | 'error';
  title: string;
  message: string;
}

type BaseAddressMeta = {
  name?: string;
  isMimir?: boolean;
  isPure?: undefined;
  isProxied?: undefined;
  isProxy?: undefined;
  isInjected?: undefined;
  isMultisig?: undefined;
  threshold?: number;
  who?: string[];
  createdBlock?: string;
  createdBlockHash?: HexString;
  createdExtrinsicHash?: HexString;
  createdExtrinsicIndex?: number;
  creator?: HexString;
  disambiguationIndex?: number;
  pureCreatedAt?: HexString;
  delegatees?: string[];
  multipleMultisig?: boolean;
  proxyType?: string;
  network?: HexString;
  proxyNetworks?: HexString[];
  delay?: number;
  cryptoType?: string;
  source?: string;
};

type ProxiedAddressMeta = Omit<BaseAddressMeta, 'isProxied'> & {
  isProxied: true;
  delegatees: string[];
  multipleMultisig: boolean;
  proxyNetworks: HexString[];
};

type ProxyAddressMeta = Omit<BaseAddressMeta, 'isProxy'> & {
  isProxy: true;
  proxyType: string;
  network: HexString;
  delay: number;
};

type InjectedAddressMeta = Omit<BaseAddressMeta, 'isInjected'> & {
  isInjected: true;
  cryptoType: string;
  source: string;
};

type MultisigAddressMeta = Omit<BaseAddressMeta, 'isMultisig'> & {
  isMultisig: true;
  threshold: number;
  who: string[];
};

type PureAddressMeta = Omit<BaseAddressMeta, 'isPure'> & {
  isPure: true;
  createdBlock: string;
  createdBlockHash: HexString;
  createdExtrinsicHash: HexString;
  createdExtrinsicIndex: number;
  creator: HexString;
  disambiguationIndex: number;
  pureCreatedAt: HexString;
};

export type AddressMeta =
  | MultisigAddressMeta
  | PureAddressMeta
  | ProxiedAddressMeta
  | ProxyAddressMeta
  | InjectedAddressMeta
  | BaseAddressMeta;

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
  genesisHash: HexString;
  delay?: number;
  address: string;
};

type OriginFilterPath = {
  id: string;
  type: 'origin';
  address: string;
};

type ProposerFilterPath = {
  id: string;
  type: 'proposer';
  address: string;
};

export type FilterPath = MultisigFilterPath | ProxyFilterPath | OriginFilterPath | ProposerFilterPath;

export type FilterPathWithoutId =
  | Omit<MultisigFilterPath, 'id'>
  | Omit<ProxyFilterPath, 'id'>
  | Omit<OriginFilterPath, 'id'>
  | Omit<ProposerFilterPath, 'id'>;

export interface BatchTxItem {
  id: number;
  calldata: HexString;
  website?: string;
  iconUrl?: string;
  appName?: string;
  relatedBatch?: number;
}

export interface PalletAssetRegistryAssetDetails extends Struct {
  readonly name: Option<Bytes>;
  readonly symbol: Option<Bytes>;
  readonly decimals: Option<u8>;
  readonly existentialDeposit: u128;
}

export interface OrmlTokensAccountData extends Struct {
  readonly free: u128;
  readonly reserved: u128;
  readonly frozen: u128;
}

export interface AssetMetadata extends Struct {
  readonly name: Bytes;
  readonly symbol: Bytes;
  readonly decimals: u8;
  readonly minimalBalance: u128;
}
