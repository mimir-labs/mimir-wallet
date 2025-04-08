// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { HexString } from '@polkadot/util/types';

import { BATCH_SYNC_TX_V2_PREFIX } from '@/constants';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { addressToHex } from '@mimir-wallet/polkadot-core';
import { service, useLocalStore, useQuery } from '@mimir-wallet/service';

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
  const addressHex = useMemo(() => (address ? addressToHex(address) : ''), [address]);
  const { data, isFetched, isFetching } = useQuery<SyncBatchItem[]>({
    queryHash: service.getClientUrl(`chains/${network}/${addressHex}/transactions/batch`),
    queryKey: [addressHex ? service.getClientUrl(`chains/${network}/${addressHex}/transactions/batch`) : null]
  });
  const [, addTx] = useBatchTxs(address);
  const [synced, setSynced] = useLocalStore<Record<HexString, number[]>>(`${BATCH_SYNC_TX_V2_PREFIX}${network}`, {});
  const [list, setList] = useState<SyncBatchItem[]>([]);

  useEffect(() => {
    setList(
      (data || []).filter((item) =>
        addressHex && synced[addressHex] ? !synced[addressHex]?.some((tx) => tx === item.id) : true
      )
    );
  }, [data, addressHex, synced]);

  const restore = useCallback(() => {
    if (!list.length || !addressHex) return;

    addTx(
      list.map((item) => ({ calldata: item.call, relatedBatch: item.id })),
      false
    );
    setSynced((_synced) => ({
      ..._synced,
      [addressHex]: [...(_synced?.[addressHex] || []), ...list.map((item) => item.id)]
    }));
  }, [addTx, addressHex, list, setSynced]);

  return [list, restore, isFetched, isFetching];
}
