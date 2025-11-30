// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { HistoryTransaction, SubscanExtrinsic, Transaction } from './types';

import { events } from '@/events';
import { isEqual } from 'lodash-es';
import { useEffect, useMemo } from 'react';

import {
  addressToHex,
  allEndpoints,
  encodeAddress,
  type Endpoint,
  useChain,
  useChains,
  useSs58Format
} from '@mimir-wallet/polkadot-core';
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
  const chain = useChain(network);
  const chainSS58 = chain.ss58Format;
  const addressHex = useMemo(() => (address ? addressToHex(address.toString()) : ''), [address]);

  const { data, isFetched, isFetching, refetch } = useQuery({
    queryKey: ['pending-transactions', network, addressHex, txId] as const,
    enabled: !!addressHex,
    staleTime: 0,
    queryFn: ({ queryKey: [, network, addressHex, txId] }): Promise<Transaction[]> =>
      service.transaction.getPendingTransactions(network, addressHex, txId),
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
  const { ss58: chainSS58 } = useSs58Format();
  const addressHex = useMemo(() => (address ? addressToHex(address.toString()) : ''), [address]);

  const data = useQueries({
    queries: networks.map((network) => ({
      queryKey: ['pending-transactions', network, addressHex, txId] as const,
      // Only enable query when address is provided
      enabled: !!addressHex,
      structuralSharing: (prev: unknown | undefined, next: unknown): Transaction[] => {
        const nextTransactions = (next as Transaction[]).map((item) => transformTransaction(chainSS58, item));

        return isEqual(prev, nextTransactions) ? (prev as Transaction[]) : nextTransactions;
      },
      queryFn: async ({
        queryKey: [, network, addressHex, txId]
      }: {
        queryKey: readonly [string, string, string | null | undefined, string | undefined];
      }): Promise<Transaction[]> => {
        // Validate address before making request
        if (!addressHex) {
          throw new Error('Address is required');
        }

        const data = await fetcher(
          txId
            ? `${API_CLIENT_GATEWAY}/chains/${network}/${addressHex}/transactions/pending?tx_id=${txId}`
            : `${API_CLIENT_GATEWAY}/chains/${network}/${addressHex}/transactions/pending`
        );

        return data.map((item: any) => ({ ...item, network }));
      }
    }))
  });

  return useMemo(() => data.map((item) => ({ ...item, data: item.data || [] })), [data]);
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
  const chain = useChain(network ?? '');
  const chainSS58 = chain.ss58Format;

  const { data, fetchNextPage, hasNextPage, isFetched, isFetching, isFetchingNextPage } = useInfiniteQuery<any[]>({
    initialPageParam: null,
    queryKey: ['history-transactions', network, address, txId, limit] as const,
    enabled: !!network && !!address,
    queryFn: async ({ pageParam, queryKey }) => {
      const [, network, address, txId, limit] = queryKey as readonly [
        string,
        string | undefined,
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
    structuralSharing: (prev, next) => {
      return isEqual(prev, next) ? prev : next;
    },
    maxPages: 100,
    refetchInterval: 0
  });

  return [
    useMemo(
      () => data?.pages.flat().map((item) => transformTransaction(chainSS58, item) as HistoryTransaction) || [],
      [chainSS58, data?.pages]
    ),
    isFetched,
    isFetching,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage
  ];
}

export function useTransactionDetail(
  network: string,
  id?: string
): [transactions: Transaction | undefined, isFetched: boolean, isFetching: boolean] {
  const chain = useChain(network);
  const chainSS58 = chain.ss58Format;

  const { data, isFetched, isFetching } = useQuery({
    queryKey: ['transaction-detail', network, id] as const,
    enabled: !!id,
    queryFn: ({ queryKey: [, network, id] }): Promise<Transaction> =>
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
  const { chains } = useChains();

  // Get enabled network keys
  const enabledNetworks = useMemo(() => new Set(chains.filter((c) => c.enabled).map((c) => c.key)), [chains]);

  const { data, isFetched, isFetching } = useQuery({
    queryKey: ['transaction-counts', addressHex] as const,
    refetchOnMount: false,
    enabled: !!addressHex,
    queryFn: ({ queryKey: [, addressHex] }): Promise<Record<string, { pending: number; history: number }>> =>
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
      () => Object.fromEntries(Object.entries(data || {}).filter(([network]) => enabledNetworks.has(network))),
      [data, enabledNetworks]
    ),
    isFetched,
    isFetching
  ];
}

export function useValidTransactionNetworks(address?: string | null) {
  const { chains } = useChains();
  const [transactionCounts, isFetched, isFetching] = useMultiChainTransactionCounts(address);

  // Create a map from network key to chain info for enabled networks
  const enabledChainsMap = useMemo(() => new Map(chains.filter((c) => c.enabled).map((c) => [c.key, c])), [chains]);

  const [validPendingNetworks, validHistoryNetworks] = useMemo(() => {
    const validPendingNetworks: { network: string; counts: number; chain: Endpoint }[] = [];
    const validHistoryNetworks: { network: string; counts: number; chain: Endpoint }[] = [];

    // Create network order mapping based on config.ts
    const networkOrderMap = new Map(allEndpoints.map((endpoint, index) => [endpoint.key, index]));

    Object.entries(transactionCounts || {}).forEach(([network, counts]) => {
      const chain = enabledChainsMap.get(network);

      if (counts.pending > 0 && chain) {
        validPendingNetworks.push({
          network,
          counts: counts.pending,
          chain
        });
      }

      if (counts.history > 0 && chain) {
        validHistoryNetworks.push({
          network,
          counts: counts.history,
          chain
        });
      }
    });

    // Sort by config.ts order
    const sortByConfigOrder = (a: { network: string }, b: { network: string }) => {
      const orderA = networkOrderMap.get(a.network) ?? Infinity;
      const orderB = networkOrderMap.get(b.network) ?? Infinity;

      return orderA - orderB;
    };

    return [
      validPendingNetworks.filter((item) => networkOrderMap.has(item.network)).sort(sortByConfigOrder),
      validHistoryNetworks.filter((item) => networkOrderMap.has(item.network)).sort(sortByConfigOrder)
    ];
  }, [enabledChainsMap, transactionCounts]);

  return [{ validPendingNetworks, validHistoryNetworks }, isFetched, isFetching] as const;
}

/**
 * Fetch simple transaction history from Subscan API
 * Automatically filters out multisig and proxy transactions
 * @param network - Chain identifier
 * @param address - Account address
 * @param row - Number of records (default: 100, max: 100)
 * @returns [data, isFetched, isFetching]
 */
export function useSimpleHistory(
  network?: string,
  address?: string | null,
  row = 100
): [data: SubscanExtrinsic[], isFetched: boolean, isFetching: boolean] {
  const { data, isFetched, isFetching } = useQuery({
    queryKey: ['simple-history', network, address, row] as const,
    enabled: !!network && !!address,
    queryFn: async ({ queryKey }) => {
      const [, network, address, row] = queryKey as readonly [string, string | undefined, string | null, number];

      if (!network) {
        throw new Error('Network is required');
      }

      if (!address) {
        throw new Error('Address is required');
      }

      const result = await service.transaction.getSimpleHistory(network, address, row);

      return result as SubscanExtrinsic[];
    },
    structuralSharing: (prev, next) => {
      return isEqual(prev, next) ? prev : next;
    }
  });

  return [data || [], isFetched, isFetching];
}
