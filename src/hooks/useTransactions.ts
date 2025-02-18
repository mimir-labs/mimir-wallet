// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Endpoint } from '@mimir-wallet/config';
import type { HistoryTransaction, Transaction } from './types';

import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { isEqual } from 'lodash-es';
import { useEffect, useState } from 'react';

import { encodeAddress } from '@mimir-wallet/api';
import { chainLinks } from '@mimir-wallet/api/chain-links';
import { fetcher } from '@mimir-wallet/utils';

import { useApi } from './useApi';

function transformTransaction(transaction: Transaction, ss58Format: number): Transaction {
  const tx = { ...transaction };

  tx.address = encodeAddress(tx.address, ss58Format);

  if (tx.delegate) {
    tx.delegate = encodeAddress(tx.delegate, ss58Format);
  }

  if (tx.members) {
    tx.members = tx.members.map((item) => encodeAddress(item, ss58Format));
  }

  return {
    ...tx,
    children: tx.children.map((item) => transformTransaction(item, ss58Format))
  };
}

export function usePendingTransactions(
  address?: string | null,
  txId?: string
): [transactions: Transaction[], isFetched: boolean, isFetching: boolean] {
  const { chain, chainSS58 } = useApi();
  const { data, isFetched, isFetching } = useQuery<Transaction[]>({
    initialData: [],
    queryHash: chainLinks.serviceUrl(chain, `tx/pending?address=${address}&tx_id=${txId || ''}`),
    queryKey: [address ? chainLinks.serviceUrl(chain, `tx/pending?address=${address}&tx_id=${txId || ''}`) : null],
    structuralSharing: (prev: unknown | undefined, next: unknown): Transaction[] => {
      const nextData = (next as Transaction[]).map((item) => transformTransaction(item, chainSS58));

      return isEqual(prev, nextData) ? (prev as Transaction[]) || [] : nextData;
    }
  });

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
  const { chain, chainSS58 } = useApi();
  const [txs, setTxs] = useState<HistoryTransaction[]>([]);

  const { data, fetchNextPage, hasNextPage, isFetched, isFetching, isFetchingNextPage } = useInfiniteQuery<any[]>({
    initialPageParam: null,
    queryKey: [
      address ? chainLinks.serviceUrl(chain, `tx/history?address=${address}&limit=${limit}&tx_id=${txId || ''}`) : null
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
        const newData = data.pages.flat().map((item) => transformTransaction(item, chainSS58) as HistoryTransaction);

        return isEqual(newData, value) ? value : newData;
      });
    }
  }, [chainSS58, data]);

  return [txs, isFetched, isFetching, hasNextPage, isFetchingNextPage, fetchNextPage];
}

export function useTransactionDetail(
  id?: string
): [transactions: Transaction | null, isFetched: boolean, isFetching: boolean] {
  const { chain, chainSS58 } = useApi();
  const { data, isFetched, isFetching } = useQuery<Transaction | null>({
    initialData: null,
    queryHash: chainLinks.serviceUrl(chain, `tx-details/${id}`),
    queryKey: [id ? chainLinks.serviceUrl(chain, `tx-details/${id}`) : null],
    structuralSharing: (prev: unknown | undefined, next: unknown): Transaction | null => {
      const nextData = next ? transformTransaction(next as Transaction, chainSS58) : null;

      return isEqual(prev, nextData) ? (prev as Transaction) || null : nextData;
    }
  });

  return [data, isFetched, isFetching];
}
