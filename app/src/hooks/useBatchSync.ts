// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { HexString } from '@polkadot/util/types';

import { service } from '@/utils';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { useQuery } from '@mimir-wallet/service';

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
  const { data, isFetched, isFetching, refetch } = useQuery<SyncBatchItem[]>({
    queryHash: service.getClientUrl(`/v1/chains/${network}/${address}/transactions/batch`),
    queryKey: [address ? service.getClientUrl(`/v1/chains/${network}/${address}/transactions/batch`) : null]
  });
  const [txs, addTx] = useBatchTxs(address);
  const syncedIds = useMemo(() => {
    return txs.map((item) => item.relatedBatch).filter((item) => typeof item === 'number');
  }, [txs]);
  // const [synced, setSynced] = useLocalStore<Record<string, number[]>>(`${BATCH_SYNC_TX_PREFIX}${network}`, {});
  const [list, setList] = useState<SyncBatchItem[]>([]);
  const [restoreList, setRestoreList] = useState<SyncBatchItem[]>([]);

  useEffect(() => {
    setList((data || []).filter((item) => !syncedIds.includes(item.id)));
    setRestoreList((data || []).filter((item) => syncedIds.includes(item.id)));
  }, [data, address, syncedIds]);

  const restore = useCallback(
    (values: number[]) => {
      if (!list.length || !address) return;

      addTx(
        list.filter((item) => values.includes(item.id)).map((item) => ({ calldata: item.call, relatedBatch: item.id })),
        false
      );
    },
    [addTx, address, list]
  );

  return [list, restoreList, restore, isFetched, isFetching, refetch];
}
