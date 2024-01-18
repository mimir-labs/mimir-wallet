// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { Call } from '@polkadot/types/interfaces';
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
  threshold: number;
  name: string;
  pure: HexString | null;
  blockNumber: number | null;
  extrinsicIndex: number | null;
  isDone: boolean;
}

export type AccountDataType = 'unknown' | 'eoa' | 'multi' | 'proxy';

export interface AccountData {
  type: AccountDataType;
  name: string | null;
  address: HexString;
  isValid: boolean;
  networks: HexString[];
}

export interface EOAAccountData extends AccountData {
  type: 'eoa';
}

export interface MultiAccountData extends AccountData {
  type: 'multi';
  who: AccountData[];
  threshold: number;
}

export interface ProxyAccountData extends AccountData {
  type: 'proxy';
  delegators: AccountData[];
  isMulti: boolean;
  creator: HexString;
  height: number;
  index: number;
}

export enum CalldataStatus {
  Initialized = 0,
  Pending = 1,
  Success = 2,
  Failed = 3,
  MemberChanged = 4,
  Cancelled = 5
}

export interface Calldata {
  uuid: string;
  hash: HexString;
  metadata: HexString;
  sender: HexString;
  isStart: boolean;
  isEnd: boolean;
  status: CalldataStatus;

  height?: number;
  index?: number;
  isValid: boolean;

  website?: string;
}

export interface Transaction {
  isFinalized: boolean;

  top: Transaction;
  parent: Transaction;
  cancelTx: Transaction | null;
  children: Transaction[];
  cancelChildren: Transaction[];

  uuid: string;
  call: Call;
  sender: string;
  status: CalldataStatus;
  isValid: boolean;
  height?: number;
  index?: number;

  action: string;
  section: string;
  method: string;

  website?: string;

  initTransaction: Transaction;

  addChild(transaction: Transaction): Transaction;
}

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

export interface BestTx {
  addresses: HexString[];
  blockNumber: number;
  blockHash: HexString;
  extrinsicHash: HexString;
  extrinsicIndex: number;
  genesisHash: HexString;
  id: number;
  method: HexString;
  signer: HexString;
}
