// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { Call } from '@polkadot/types/interfaces';
import type { Calldata, CalldataStatus, Transaction } from './types';

import { getServiceUrl } from '@mimir-wallet/utils/service';
import { addressEq, encodeAddress } from '@polkadot/util-crypto';
import { useMemo } from 'react';
import useSWR from 'swr';

import { useApi } from './useApi';

function createTransaction(api: ApiPromise, calldata: Calldata): Transaction {
  let _action: string | undefined;

  class Instance implements Transaction {
    private api: ApiPromise;

    public top: Transaction | null;
    public parent: Transaction | null;
    public cancelTx: Transaction | null;
    public children: Transaction[];
    public cancelChildren: Transaction[];

    public uuid: string;
    public call: Call;
    public sender: string;
    public status: CalldataStatus;
    public isValid: boolean;
    public height?: number;
    public index?: number;

    public website?: string;

    public initTransaction!: Transaction;

    constructor(api: ApiPromise) {
      this.api = api;
      this.top = null;
      this.parent = null;
      this.cancelTx = null;
      this.children = [];
      this.cancelChildren = [];
      this.uuid = calldata.uuid;
      this.call = api.registry.createType('Call', calldata.metadata);
      this.sender = encodeAddress(calldata.sender);
      this.status = calldata.status;
      this.isValid = calldata.isValid;
      this.height = calldata.height;
      this.index = calldata.index;
      this.website = calldata.website;
    }

    private addCancelChild(transaction: Transaction): Transaction {
      const existValue = this.cancelChildren.find((item) => item.uuid === transaction.uuid);

      if (existValue) return existValue;

      this.cancelChildren.push(transaction);
      transaction.cancelTx = this;

      return transaction;
    }

    public addChild(transaction: Transaction): Transaction {
      if (this.api.tx.multisig.cancelAsMulti.is(transaction.call)) {
        return this.addCancelChild(transaction);
      }

      const existValue = this.children.find((item) => item.uuid === transaction.uuid);

      if (existValue) return existValue;

      if (this.top) {
        transaction.top = this.top;
      } else {
        transaction.top = this;
      }

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

function extraTransaction(api: ApiPromise, calldatas: Calldata[][], sender: string): Transaction[] {
  if (calldatas.length === 0) return [];

  const transactionMap: Map<string, Transaction> = new Map();
  const senderTransactionMap: Map<string, Transaction> = new Map();

  for (const items of calldatas) {
    if (items.length === 0) continue;

    let transaction: Transaction | undefined | null = transactionMap.get(items[items.length - 1].uuid);

    if (!transaction) {
      transaction = createTransaction(api, items[items.length - 1]);
      transactionMap.set(transaction.uuid, transaction);
    }

    for (let i = items.length - 2; i >= 0; i--) {
      const calldata = items[i];

      transaction = transaction.addChild(createTransaction(api, calldata));
    }

    const initTransaction = transaction;

    while (transaction) {
      if (addressEq(transaction.sender, sender)) {
        senderTransactionMap.set(transaction.uuid, transaction);
      }

      if (!transaction.initTransaction) {
        transaction.initTransaction = initTransaction;
      } else {
        if ((transaction.initTransaction.height || 0) > (initTransaction.height || 0)) {
          transaction.initTransaction = initTransaction;
        }
      }

      transaction = transaction.parent;
    }
  }

  return Array.from(senderTransactionMap.values());
}

export function useTransactions(address?: string): [transactions: Transaction[], isLoading: boolean] {
  const { api, isApiReady } = useApi();

  const { data, isLoading } = useSWR<Calldata[][]>(isApiReady && address ? getServiceUrl(`tx?address=${address}`) : null);

  const transactions = useMemo(() => (address && data && data.length > 0 ? extraTransaction(api, data, address) : []), [address, api, data]);

  return [transactions, isLoading];
}
