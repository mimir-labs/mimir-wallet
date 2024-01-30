// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { Call } from '@polkadot/types/interfaces';
import type { BestTx, Calldata, CalldataStatus, Transaction } from './types';

import { getServiceUrl } from '@mimir-wallet/utils/service';
import { addressEq, encodeAddress } from '@polkadot/util-crypto';
import { useEffect, useState } from 'react';
import useSWR from 'swr';

import { useApi } from './useApi';
import { mergeCalldata } from './utils';

export function createTransaction(api: ApiPromise, calldata: Calldata, isFinalized: boolean): Transaction {
  let _action: string | undefined;

  class Instance implements Transaction {
    private api: ApiPromise;

    public isFinalized = isFinalized;
    public parent: Transaction;
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
      this.parent = this;
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

    public get top(): Transaction {
      return this.parent === this ? this : this.parent.top;
    }
  }

  return new Instance(api);
}

function extraTransaction(api: ApiPromise, transactionCache: Map<string, Transaction>, calldatas: Calldata[][]): void {
  if (calldatas.length === 0) return;

  for (const items of calldatas) {
    if (items.length === 0) continue;

    let transaction: Transaction | undefined | null = transactionCache.get(items[items.length - 1].uuid);

    if (!transaction) {
      transaction = createTransaction(api, items[items.length - 1], true);
      transactionCache.set(transaction.uuid, transaction);
    }

    for (let i = items.length - 2; i >= 0; i--) {
      const calldata = items[i];

      transaction = transaction.addChild(createTransaction(api, calldata, true));
      transactionCache.set(transaction.uuid, transaction);
    }

    const initTransaction = transaction;

    while (true) {
      if (!transaction.initTransaction) {
        transaction.initTransaction = initTransaction;
      } else {
        if ((transaction.initTransaction.height || 0) > (initTransaction.height || 0)) {
          transaction.initTransaction = initTransaction;
        }
      }

      if (transaction === transaction.parent) {
        break;
      }

      transaction = transaction.parent;
    }
  }
}

export function useTransactions(address?: string): [transactions: Transaction[], isLoading: boolean] {
  const { api, isApiReady } = useApi();

  const { data, isLoading, mutate } = useSWR<{ bestTx: BestTx[]; tx: Calldata[][] }>(isApiReady && address ? getServiceUrl(`tx?address=${address}`) : null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    if (address && data) {
      const transactionCache: Map<string, Transaction> = new Map();

      extraTransaction(api, transactionCache, data.tx);

      if (data.bestTx.length > 0) {
        mergeCalldata(api, transactionCache, data.bestTx).then(() => {
          setTransactions(Array.from(transactionCache.values()).filter((item) => addressEq(address, item.sender)));
        });
      } else {
        setTransactions(Array.from(transactionCache.values()).filter((item) => addressEq(address, item.sender)));
      }
    }
  }, [address, api, data]);

  useEffect(() => {
    if (!isApiReady) return;

    const unsub = api.rpc.chain.subscribeNewHeads(() => {
      setTimeout(() => {
        mutate();
      }, 1000);
    });

    return () => {
      unsub.then((fn) => fn());
    };
  }, [api.rpc.chain, isApiReady, mutate]);

  return [transactions, isLoading];
}
