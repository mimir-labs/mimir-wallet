// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { HistoryTransaction, Transaction } from './types';

import { encodeAddress } from '@/api';
import { events } from '@/events';
import { service } from '@/utils';
import { isEqual } from 'lodash-es';
import { useEffect, useState } from 'react';

import { fetcher, useInfiniteQuery, useQuery } from '@mimir-wallet/service';

function transformTransaction(transaction: Transaction): Transaction {
  const tx = { ...transaction };

  tx.address = encodeAddress(tx.address);

  if (tx.delegate) {
    tx.delegate = encodeAddress(tx.delegate);
  }

  if (tx.members) {
    tx.members = tx.members.map((item) => encodeAddress(item));
  }

  if (tx.proposer) {
    tx.proposer = encodeAddress(tx.proposer);
  }

  return {
    ...tx,
    children: tx.children
      .filter(
        (item, index, self) => self.findIndex((t) => t.createdExtrinsicHash === item.createdExtrinsicHash) === index
      )
      .map((item) => transformTransaction(item))
  };
}

export function usePendingTransactions(
  address?: string | null,
  txId?: string
): [transactions: Transaction[], isFetched: boolean, isFetching: boolean] {
  const { data, isFetched, isFetching, refetch } = useQuery<Transaction[]>({
    initialData: [],
    queryHash: service.getNetworkUrl(`tx/pending?address=${address}&tx_id=${txId || ''}`),
    queryKey: [address ? service.getNetworkUrl(`tx/pending?address=${address}&tx_id=${txId || ''}`) : null],
    structuralSharing: (prev: unknown | undefined, next: unknown): Transaction[] => {
      const nextData = (next as Transaction[]).map((item) => transformTransaction(item));

      return isEqual(prev, nextData) ? (prev as Transaction[]) || [] : nextData;
    }
  });

  useEffect(() => {
    events.on('refetch_pending_tx', refetch);

    return () => {
      events.off('refetch_pending_tx', refetch);
    };
  }, [refetch]);

  return [data, isFetched, isFetching];
}

export function useHistoryTransactions(
  address?: string | null,
  limit = 20,
  txId?: string
): [
  transactions: HistoryTransaction[],
  isFetched: boolean,
  isFetching: boolean,
  hasNextPage: boolean,
  isFetchingNextPage: boolean,
  fetchNextPage: () => void
] {
  const [txs, setTxs] = useState<HistoryTransaction[]>([]);

  const { data, fetchNextPage, hasNextPage, isFetched, isFetching, isFetchingNextPage } = useInfiniteQuery<any[]>({
    initialPageParam: null,
    queryKey: [
      address ? service.getNetworkUrl(`tx/history?address=${address}&limit=${limit}&tx_id=${txId || ''}`) : null
    ],
    queryFn: async ({ pageParam, queryKey }) => {
      if (!queryKey[0]) {
        return undefined;
      }

      return fetcher(pageParam ? `${queryKey[0]}&next_cursor=${pageParam}` : `${queryKey[0]}`);
    },
    getNextPageParam: (data, allPages) => {
      if (allPages.length === 100) {
        return null;
      }

      if (data.length) {
        return data.length === limit ? data[data.length - 1].uuid : null;
      }

      return null;
    },
    maxPages: 100,
    refetchInterval: 0
  });

  useEffect(() => {
    if (data) {
      setTxs((value) => {
        const newData = data.pages.flat().map((item) => transformTransaction(item) as HistoryTransaction);

        return isEqual(newData, value) ? value : newData;
      });
    }
  }, [data]);

  return [txs, isFetched, isFetching, hasNextPage, isFetchingNextPage, fetchNextPage];
}

export function useTransactionDetail(
  id?: string
): [transactions: Transaction | null, isFetched: boolean, isFetching: boolean] {
  const { data, isFetched, isFetching } = useQuery<Transaction | null>({
    initialData: null,
    queryHash: service.getNetworkUrl(`tx-details/${id}`),
    queryKey: [id ? service.getNetworkUrl(`tx-details/${id}`) : null],
    structuralSharing: (prev: unknown | undefined, next: unknown): Transaction | null => {
      const nextData = next ? transformTransaction(next as Transaction) : null;

      return isEqual(prev, nextData) ? (prev as Transaction) || null : nextData;
    }
  });

  return [data, isFetched, isFetching];
}
