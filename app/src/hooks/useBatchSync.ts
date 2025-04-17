// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { HexString } from '@polkadot/util/types';

import { useCallback, useEffect, useMemo, useState } from 'react';

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
): [list: SyncBatchItem[], restoreList: SyncBatchItem[], () => void, boolean, boolean] {
  const addressHex = useMemo(() => (address ? addressToHex(address) : ''), [address]);

  const { data, isFetched, isFetching } = useQuery<SyncBatchItem[]>({
    queryHash: service.getClientUrl(`chains/${network}/${addressHex}/transactions/batch`),
    queryKey: [addressHex ? service.getClientUrl(`chains/${network}/${addressHex}/transactions/batch`) : null]
  });
  const [txs, addTx] = useBatchTxs(network, address);
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

  const restore = useCallback(() => {
    if (!list.length || !addressHex) return;

    addTx(
      list.map((item) => ({ calldata: item.call, relatedBatch: item.id })),
      false
    );
  }, [addTx, addressHex, list]);

  return [list, restoreList, restore, isFetched, isFetching];
}
