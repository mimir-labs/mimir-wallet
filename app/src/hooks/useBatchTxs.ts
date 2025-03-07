// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { BatchTxItem } from './types';

import { BATCH_TX_PREFIX } from '@/constants';
import { events } from '@/events';
import { useCallback, useMemo } from 'react';

import { useApi } from './useApi';
import { useLocalStore } from './useStore';

type BatchTxs = Record<string, BatchTxItem[]>; // address => BatchTxItem[]

export function useBatchTxs(
  address?: string | null
): [
  txs: BatchTxItem[],
  addTx: (value: Omit<BatchTxItem, 'id'>[], alert?: boolean) => void,
  deleteTx: (ids: number[]) => void,
  setTx: (txs: BatchTxItem[]) => void
] {
  const { genesisHash } = useApi();
  const [values, setValues] = useLocalStore<BatchTxs>(`${BATCH_TX_PREFIX}${genesisHash}`, {});

  const txs = useMemo(() => (address ? values?.[address] || [] : []), [address, values]);
  const addTx = useCallback(
    (value: Omit<BatchTxItem, 'id'>[], alert = true) => {
      if (!address) return;

      const id = txs.length ? Math.max(...txs.map((item) => item.id)) + 1 : 1;

      const added: BatchTxItem[] = value.map((item, index) => ({ ...item, id: id + index }));

      setValues((_values) => ({
        ...(_values || {}),
        [address]: [...(_values?.[address] || []), ...added]
      }));
      events.emit('batch_tx_added', added, alert);
    },
    [address, setValues, txs]
  );
  const deleteTx = useCallback(
    (ids: number[]) => {
      if (!address) return;

      setValues((_values) => ({
        ...(_values || {}),
        [address]: (_values?.[address] || []).filter((item) => !ids.includes(item.id))
      }));
    },
    [address, setValues]
  );
  const setTx = useCallback(
    (txs: BatchTxItem[]) => {
      if (!address) return;

      setValues((_values) => ({
        ...(_values || {}),
        [address]: txs
      }));
    },
    [address, setValues]
  );

  return [txs, addTx, deleteTx, setTx];
}
