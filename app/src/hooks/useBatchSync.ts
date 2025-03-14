// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { HexString } from '@polkadot/util/types';

import { BATCH_SYNC_TX_PREFIX } from '@/constants';
import { service } from '@/utils';
import { useCallback, useEffect, useState } from 'react';

import { useLocalStore, useQuery } from '@mimir-wallet/service';

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

export function useBatchSync(network: string, address?: string): [SyncBatchItem[], () => void, boolean, boolean] {
  const { data, isFetched, isFetching } = useQuery<SyncBatchItem[]>({
    queryHash: service.getClientUrl(`/v1/chains/${network}/${address}/transactions/batch`),
    queryKey: [address ? service.getClientUrl(`/v1/chains/${network}/${address}/transactions/batch`) : null]
  });
  const [, addTx] = useBatchTxs(address);
  const [synced, setSynced] = useLocalStore<Record<string, number[]>>(`${BATCH_SYNC_TX_PREFIX}${network}`, {});
  const [list, setList] = useState<SyncBatchItem[]>([]);

  useEffect(() => {
    setList(
      (data || []).filter((item) =>
        address && synced[address] ? !synced[address]?.some((tx) => tx === item.id) : true
      )
    );
  }, [data, address, synced]);

  const restore = useCallback(() => {
    if (!list.length || !address) return;

    addTx(
      list.map((item) => ({ calldata: item.call, relatedBatch: item.id })),
      false
    );
    setSynced((_synced) => ({
      ..._synced,
      [address]: [...(_synced?.[address] || []), ...list.map((item) => item.id)]
    }));
  }, [addTx, address, list, setSynced]);

  return [list, restore, isFetched, isFetching];
}
