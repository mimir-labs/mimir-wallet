// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { HistoryTransaction, Transaction } from './types';

import { events } from '@/events';
import { isEqual } from 'lodash-es';
import { useEffect, useMemo, useState } from 'react';

import { addressToHex, encodeAddress, useApi } from '@mimir-wallet/polkadot-core';
import { API_CLIENT_GATEWAY, fetcher, service, useInfiniteQuery, useQueries, useQuery } from '@mimir-wallet/service';

function transformTransaction(chainSS58: number, transaction: Transaction): Transaction {
  const tx = { ...transaction };

  tx.address = encodeAddress(tx.address, chainSS58);

  if (tx.delegate) {
    tx.delegate = encodeAddress(tx.delegate, chainSS58);
  }

  if (tx.members) {
    tx.members = tx.members.map((item) => encodeAddress(item, chainSS58));
  }

  if (tx.proposer) {
    tx.proposer = encodeAddress(tx.proposer, chainSS58);
  }

  return {
    ...tx,
    children: tx.children
      .filter(
        (item, index, self) => self.findIndex((t) => t.createdExtrinsicHash === item.createdExtrinsicHash) === index
      )
      .map((item) => transformTransaction(chainSS58, item))
  };
}

export function usePendingTransactions(
  network: string,
  address?: string | null,
  txId?: string
): [transactions: Transaction[], isFetched: boolean, isFetching: boolean] {
  const { chainSS58 } = useApi();

  const { data, isFetched, isFetching, refetch } = useQuery({
    queryKey: [network, address, txId] as const,
    queryHash: `pending-transactions-${network}-${address}-${txId || 'all'}`,
    enabled: !!address,
    queryFn: ({ queryKey: [network, address, txId] }): Promise<Transaction[]> =>
      service.transaction.getPendingTransactions(network, address!, txId),
    structuralSharing: (prev, next) => {
      return isEqual(prev, next) ? prev : next;
    }
  });

  useEffect(() => {
    events.on('refetch_pending_tx', refetch);

    return () => {
      events.off('refetch_pending_tx', refetch);
    };
  }, [refetch]);

  return [
    useMemo(() => data?.map((item) => transformTransaction(chainSS58, item)) || [], [chainSS58, data]),
    isFetched,
    isFetching
  ];
}

export function useMultichainPendingTransactions(networks: string[], address?: string | null, txId?: string) {
  const { chainSS58 } = useApi();

  const data = useQueries({
    queries: networks.map((network) => ({
      initialData: [],
      queryKey: [network, address, txId] as [network: string, address?: string | null, txId?: string],
      queryHash: `multichain-pending-transactions-${network}-${address}-${txId || 'all'}`,
      structuralSharing: (prev: unknown | undefined, next: unknown): Transaction[] => {
        const nextTransactions = (next as Transaction[]).map((item) => transformTransaction(chainSS58, item));

        return isEqual(prev, nextTransactions) ? (prev as Transaction[]) : nextTransactions;
      },
      queryFn: async ({
        queryKey: [network, address, txId]
      }: {
        queryKey: [network: string, address?: string | null, txId?: string];
      }): Promise<Transaction[]> => {
        const data = await fetcher(
          txId
            ? `${API_CLIENT_GATEWAY}/chains/${network}/${address}/transactions/pending?tx_id=${txId}`
            : `${API_CLIENT_GATEWAY}/chains/${network}/${address}/transactions/pending`
        );

        return data.map((item: any) => ({ ...item, network }));
      }
    }))
  });

  return data;
}

export function useHistoryTransactions(
  network?: string,
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
  const { chainSS58 } = useApi();
  const [txs, setTxs] = useState<HistoryTransaction[]>([]);

  const { data, fetchNextPage, hasNextPage, isFetched, isFetching, isFetchingNextPage } = useInfiniteQuery<any[]>({
    initialPageParam: null,
    queryHash: `history-transactions-v2-${network}-${address}-${txId || 'all'}-${limit}`,
    queryKey: [network, address, txId, limit] as [
      network?: string,
      address?: string | null,
      txId?: string,
      limit?: number
    ],
    enabled: !!network && !!address,
    queryFn: async ({ pageParam, queryKey }) => {
      const [network, address, txId, limit] = queryKey as [
        network?: string,
        address?: string | null,
        txId?: string,
        limit?: number
      ];

      if (!network) {
        throw new Error('Network is required');
      }

      if (!address) {
        throw new Error('Address is required');
      }

      const data = await service.transaction.getHistoryTransactionsV2(
        network,
        address,
        txId,
        pageParam ? String(pageParam) : undefined,
        limit
      );

      return data.map((item: any) => ({ ...item, network }));
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
        const newData = data.pages.flat().map((item) => transformTransaction(chainSS58, item) as HistoryTransaction);

        return isEqual(newData, value) ? value : newData;
      });
    }
  }, [data, chainSS58]);

  return [txs, isFetched, isFetching, hasNextPage, isFetchingNextPage, fetchNextPage];
}

export function useTransactionDetail(
  network: string,
  id?: string
): [transactions: Transaction | undefined, isFetched: boolean, isFetching: boolean] {
  const { chainSS58 } = useApi();

  const { data, isFetched, isFetching } = useQuery({
    queryKey: [network, id] as const,
    queryHash: `transaction-detail-${network}-${id}`,
    enabled: !!id,
    queryFn: ({ queryKey: [network, id] }): Promise<Transaction> =>
      service.transaction.getTransactionDetail(network, id!),
    structuralSharing: (prev: unknown | undefined, next: unknown): Transaction | null => {
      const nextData = next ? transformTransaction(chainSS58, next as Transaction) : null;

      return isEqual(prev, nextData) ? (prev as Transaction) || null : nextData;
    }
  });

  return [data, isFetched, isFetching];
}

export function useMultiChainTransactionCounts(
  address?: string | null
): [data: Record<string, { pending: number; history: number }>, isFetched: boolean, isFetching: boolean] {
  const addressHex = useMemo(() => (address ? addressToHex(address.toString()) : ''), [address]);
  const { allApis } = useApi();

  const { data, isFetched, isFetching } = useQuery({
    queryKey: [addressHex] as const,
    queryHash: `transaction-counts-${addressHex}`,
    refetchOnMount: false,
    enabled: !!addressHex,
    queryFn: ({ queryKey: [addressHex] }): Promise<Record<string, { pending: number; history: number }>> =>
      service.transaction.getTransactionCounts(addressHex),
    structuralSharing: (
      prev: unknown | undefined,
      next: unknown
    ): Record<string, { pending: number; history: number }> | undefined => {
      const nextData = Object.entries(next as Record<string, { pending: number; history: number }>).reduce(
        (acc, [network, { pending, history }]) => {
          acc[network] = { pending, history };

          return acc;
        },
        {} as Record<string, { pending: number; history: number }>
      );

      return isEqual(prev, nextData) ? (prev as Record<string, { pending: number; history: number }>) : nextData;
    }
  });

  return [
    useMemo(
      () => Object.fromEntries(Object.entries(data || {}).filter(([network]) => allApis[network])),
      [data, allApis]
    ),
    isFetched,
    isFetching
  ];
}
