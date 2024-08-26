// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';

import { addressEq } from '@polkadot/util-crypto';
import { useEffect, useRef, useState } from 'react';
import useSWR from 'swr';

import { getServiceUrl } from '@mimir-wallet/utils/service';

import { BestTx, Calldata, Transaction } from './types';
import { useApi } from './useApi';
import { createTransaction, mergeCalldata } from './utils';

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
      } else if ((transaction.initTransaction.height || 0) > (initTransaction.height || 0)) {
        transaction.initTransaction = initTransaction;
      }

      if (transaction === transaction.parent) {
        break;
      }

      transaction = transaction.parent;
    }
  }
}

export function usePendingTransactions(address?: string | null): [transactions: Transaction[], isLoading: boolean] {
  const { api, isApiReady } = useApi();

  const { data, isLoading, mutate } = useSWR<{ bestTx: BestTx[]; tx: Calldata[][] }>(
    isApiReady && address ? getServiceUrl(`tx/pending?address=${address}`) : null
  );
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
    let timeout: any;

    const unsub = api.rpc.chain.subscribeNewHeads(() => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        mutate();
      }, 1000);
    });

    return () => {
      unsub.then((fn) => fn());
    };
  }, [api.rpc.chain, isApiReady, mutate]);

  return [transactions, isLoading];
}

export function useHistoryTransactions(
  address?: string | null,
  page = 1,
  limit = 10
): [transactions: Transaction[], page: number, limit: number, total: number, isLoading: boolean] {
  const { api, isApiReady } = useApi();
  const totalRef = useRef<number>(0);

  const { data, isLoading } = useSWR<{ tx: Calldata[][]; page: number; limit: number; total: number }>(
    isApiReady && address ? getServiceUrl(`tx/history?address=${address}&page=${page}&limit=${limit}`) : null
  );

  if (data) {
    totalRef.current = data.total;
  }

  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    if (address && data) {
      const transactionCache: Map<string, Transaction> = new Map();

      extraTransaction(api, transactionCache, data.tx);
      setTransactions(Array.from(transactionCache.values()).filter((item) => addressEq(address, item.sender)));
    }
  }, [address, api, data]);

  return [transactions, data?.page || page, data?.limit || limit, totalRef.current, isLoading];
}
