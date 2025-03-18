// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { BatchTxItem } from './types';

import { BATCH_TX_PREFIX } from '@/constants';
import { events } from '@/events';
import { randomAsNumber } from '@polkadot/util-crypto';
import { useCallback, useMemo } from 'react';

import { useApi } from '@mimir-wallet/polkadot-core';
import { useLocalStore } from '@mimir-wallet/service';

type BatchTxs = Record<string, BatchTxItem[]>; // address => BatchTxItem[]

export function useBatchTxs(
  address?: string | null
): [
  txs: BatchTxItem[],
  addTx: (value: Omit<BatchTxItem, 'id'>[], alert?: boolean) => void,
  deleteTx: (ids: (number | string)[]) => void,
  setTx: (txs: BatchTxItem[]) => void
] {
  const { genesisHash } = useApi();
  const [values, setValues] = useLocalStore<BatchTxs>(`${BATCH_TX_PREFIX}${genesisHash}`, {});

  const txs = useMemo(() => (address ? values?.[address] || [] : []), [address, values]);
  const addTx = useCallback(
    (value: Omit<BatchTxItem, 'id'>[], alert = true) => {
      if (!address) return;

      const added: BatchTxItem[] = value.map((item) => {
        const id = randomAsNumber();

        return { ...item, id };
      });

      setValues((_values) => ({
        ...(_values || {}),
        [address]: [...(_values?.[address] || []), ...added]
      }));
      events.emit('batch_tx_added', added, alert);
    },
    [address, setValues]
  );
  const deleteTx = useCallback(
    (ids: (number | string)[]) => {
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
