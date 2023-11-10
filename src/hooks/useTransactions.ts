// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { Call } from '@polkadot/types/interfaces';
import type { Calldata, CalldataStatus, Transaction } from './types';

import { encodeAddress } from '@polkadot/util-crypto';
import { useMemo } from 'react';
import useSWR from 'swr';

import { getServiceUrl } from '@mimirdev/utils/service';

import { useApi } from './useApi';

function createTransaction(api: ApiPromise, calldata: Calldata): Transaction {
  let _action: string | undefined;

  class Instance implements Transaction {
    private api: ApiPromise;

    public parent: Transaction | null;
    public children: Transaction[];

    public uuid: string;
    public call: Call;
    public sender: string;
    public status: CalldataStatus;
    public isValid: boolean;
    public height?: number;
    public index?: number;

    constructor(api: ApiPromise) {
      this.api = api;
      this.parent = null;
      this.children = [];
      this.uuid = calldata.uuid;
      this.call = api.registry.createType('Call', calldata.metadata);
      this.sender = encodeAddress(calldata.sender);
      this.status = calldata.status;
      this.isValid = calldata.isValid;
      this.height = calldata.height;
      this.index = calldata.index;
    }

    public addChild(transaction: Transaction): Transaction {
      const existValue = this.children.find((item) => item.uuid === transaction.uuid);

      if (existValue) return existValue;

      transaction.parent = this;
      this.children.push(transaction);

      return transaction;
    }

    public get action(): string {
      if (_action) return _action;

      if (
        this.api.tx.utility.batchAll.is(this.call) &&
        this.call.args[0].length === 2 &&
        this.api.tx.proxy.addProxy.is(this.call.args[0][0]) &&
        this.api.tx.proxy.removeProxy.is(this.call.args[0][1])
      ) {
        _action = 'ChangeMembers';
      } else {
        _action = `${this.call.section}.${this.call.method}`;
      }

      return _action;
    }

    public get section() {
      return this.call.section;
    }

    public get method() {
      return this.call.method;
    }
  }

  return new Instance(api);
}

function extraTransaction(api: ApiPromise, calldatas: Calldata[][]): Transaction[] {
  if (calldatas.length === 0) return [];

  const transactionMap: Map<string, Transaction> = new Map();

  for (const items of calldatas) {
    if (items.length === 0) continue;

    let transaction: Transaction | undefined = transactionMap.get(items[items.length - 1].uuid);

    if (!transaction) {
      transaction = createTransaction(api, items[items.length - 1]);
      transactionMap.set(transaction.uuid, transaction);
    }

    for (let i = items.length - 2; i >= 0; i--) {
      const calldata = items[i];

      transaction = transaction.addChild(createTransaction(api, calldata));
    }
  }

  return Array.from(transactionMap.values());
}

export function useTransactions(address?: string): [transactions: Transaction[], isLoading: boolean] {
  const { api, isApiReady } = useApi();

  const { data, isLoading } = useSWR<Calldata[][]>(isApiReady && address ? getServiceUrl(`tx?address=${address}`) : null);

  const transactions = useMemo(() => extraTransaction(api, data || []), [api, data]);

  return [transactions, isLoading];
}
