// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

import { fetcher } from '@mimir-wallet/utils';
import { serviceUrl } from '@mimir-wallet/utils/chain-links';

import { Transaction } from './types';

export function usePendingTransactions(
  address?: string | null
): [transactions: Transaction[], isFetched: boolean, isFetching: boolean] {
  const { data, isFetched, isFetching } = useQuery<Transaction[]>({
    initialData: [],
    queryHash: serviceUrl(`tx/pending?address=${address}`),
    queryKey: [address ? serviceUrl(`tx/pending?address=${address}`) : null]
  });

  return [data, isFetched, isFetching];
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

  return [data?.pages.flat() || [], isFetched, isFetching, hasNextPage, isFetchingNextPage, fetchNextPage];
}
