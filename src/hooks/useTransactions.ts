// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { isEqual } from 'lodash-es';
import { useEffect, useState } from 'react';

import { encodeAddress } from '@mimir-wallet/api';
import { fetcher } from '@mimir-wallet/utils';
import { serviceUrl } from '@mimir-wallet/utils/chain-links';

import { Transaction } from './types';

function transformTransaction(transaction: Transaction): Transaction {
  const tx = { ...transaction };

  tx.address = encodeAddress(tx.address);

  if (tx.delegate) {
    tx.delegate = encodeAddress(tx.delegate);
  }

  if (tx.members) {
    tx.members = tx.members.map((item) => encodeAddress(item));
  }

  return {
    ...tx,
    children: tx.children.map((item) => transformTransaction(item))
  };
}

export function usePendingTransactions(
  address?: string | null
): [transactions: Transaction[], isFetched: boolean, isFetching: boolean] {
  const [txs, setTxs] = useState<Transaction[]>([]);

  const { data, isFetched, isFetching } = useQuery<Transaction[]>({
    initialData: [],
    queryHash: serviceUrl(`tx/pending?address=${address}`),
    queryKey: [address ? serviceUrl(`tx/pending?address=${address}`) : null]
  });

  useEffect(() => {
    if (data) {
      setTxs((value) => {
        const newData = data.map((item) => transformTransaction(item));

        return isEqual(newData, value) ? value : newData;
      });
    }
  }, [data]);

  return [txs, isFetched, isFetching];
}

export function useHistoryTransactions(
  address?: string | null,
  limit = 20
): [
  transactions: Transaction[],
  isFetched: boolean,
  isFetching: boolean,
  hasNextPage: boolean,
  isFetchingNextPage: boolean,
  fetchNextPage: () => void
] {
  const [txs, setTxs] = useState<Transaction[]>([]);

  const { data, fetchNextPage, hasNextPage, isFetched, isFetching, isFetchingNextPage } = useInfiniteQuery<any[]>({
    initialPageParam: null,
    queryKey: [address ? serviceUrl(`tx/history?address=${address}&limit=${limit}`) : null],
    queryFn: async ({ pageParam, queryKey }) => {
      if (!queryKey[0]) {
        return undefined;
      }

      return fetcher(pageParam ? `${queryKey[0]}&next_cursor=${pageParam}` : `${queryKey[0]}`);
    },
    getNextPageParam: (data, allPages) => {
      if (allPages.length === 20) {
        return null;
      }

      if (data.length) {
        return data.length === limit ? data[data.length - 1].id : null;
      }

      return null;
    },
    maxPages: 20,
    refetchInterval: 0
  });

  useEffect(() => {
    if (data) {
      setTxs((value) => {
        const newData = data.pages.flat().map((item) => transformTransaction(item));

        return isEqual(newData, value) ? value : newData;
      });
    }
  }, [data]);

  return [txs, isFetched, isFetching, hasNextPage, isFetchingNextPage, fetchNextPage];
}
