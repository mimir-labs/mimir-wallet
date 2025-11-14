// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { HexString } from '@polkadot/util/types';

import { useCallback, useMemo } from 'react';

import { addressToHex } from '@mimir-wallet/polkadot-core';
import { service, useQuery } from '@mimir-wallet/service';

import { useBatchTxs } from './useBatchTxs';

type SyncBatchItem = {
  id: number;
  address: HexString;
  creator: HexString;
  callHash: HexString;
  section: string;
  method: string;
  call: HexString;
  removed: boolean;
  createdAt: string;
  updatedAt: string;
};

export function useBatchSync(
  network: string,
  address?: string
): [
  list: SyncBatchItem[],
  restoreList: SyncBatchItem[],
  restore: (ids: number[]) => void,
  isFetched: boolean,
  isFetching: boolean,
  refetch: () => void
] {
  const addressHex = useMemo(() => (address ? addressToHex(address) : ''), [address]);
  const { data, isFetched, isFetching, refetch } = useQuery({
    queryKey: ['batch-sync', network, addressHex] as const,
    queryFn: ({ queryKey: [, chain, addr] }): Promise<SyncBatchItem[]> =>
      service.transaction.getBatchTransactions(chain as string, addr as string),
    enabled: !!addressHex
  });
  const [txs, addTx] = useBatchTxs(network, addressHex);
  const syncedIds = useMemo(() => {
    return txs.map((item) => item.relatedBatch).filter((item) => typeof item === 'number');
  }, [txs]);

  // Derive list and restoreList from data and syncedIds
  const list = useMemo(() => {
    return (data || []).filter((item) => !syncedIds.includes(item.id));
  }, [data, syncedIds]);

  const restoreList = useMemo(() => {
    return (data || []).filter((item) => syncedIds.includes(item.id));
  }, [data, syncedIds]);

  const restore = useCallback(
    (values: number[]) => {
      if (!list.length || !addressHex) return;

      addTx(
        list.filter((item) => values.includes(item.id)).map((item) => ({ calldata: item.call, relatedBatch: item.id })),
        false
      );
    },
    [addTx, addressHex, list]
  );

  return [list, restoreList, restore, isFetched, isFetching, refetch];
}
