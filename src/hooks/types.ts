// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
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

export enum MultisigStatus {
  Created,
  Executed,
  Cancelled
}

export interface MultisigTransaction {
  id: number;
  blockNumber: string;
  blockHash: HexString;
  extrinsicHash: HexString;
  extrinsicIndex: number;
  section: string;
  method: string;
  multisigAccount: HexString;
  depositor: HexString;
  approvedAccounts: HexString[];
  cancelledAccount?: HexString | null;
  callhash: HexString;
  status: MultisigStatus;
}

export interface PrepareMultisig {
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
