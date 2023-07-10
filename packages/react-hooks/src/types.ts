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
