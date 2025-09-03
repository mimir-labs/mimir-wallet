// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { HexString } from '@polkadot/util/types';
import type { BatchTxItem } from './types';

import IconBatch from '@/assets/svg/icon-batch.svg?react';
import { BATCH_TX_V2_PREFIX } from '@/constants';
import { randomAsNumber } from '@polkadot/util-crypto';
import { useCallback, useMemo } from 'react';
import { toast } from 'sonner';

import { addressToHex } from '@mimir-wallet/polkadot-core';
import { useLocalStore } from '@mimir-wallet/service';

import { useMimirLayout } from './useMimirLayout';

type BatchTxs = Record<HexString, BatchTxItem[]>; // addressHex => BatchTxItem[]

export function useBatchTxs(
  network?: string | null,
  address?: string | null
): [
  txs: BatchTxItem[],
  addTx: (value: Omit<BatchTxItem, 'id'>[], alert?: boolean) => void,
  deleteTx: (ids: (number | string)[]) => void,
  setTx: (txs: BatchTxItem[]) => void
] {
  const addressHex = useMemo(() => (address ? addressToHex(address) : ''), [address]);
  const [values, setValues] = useLocalStore<BatchTxs>(network ? `${BATCH_TX_V2_PREFIX}${network}` : '', {});
  const { openRightSidebar, setRightSidebarTab } = useMimirLayout();

  const txs = useMemo(() => (addressHex ? values[addressHex] || [] : []), [addressHex, values]);
  const addTx = useCallback(
    (value: Omit<BatchTxItem, 'id'>[], alert = true) => {
      if (!addressHex) return;

      const added: BatchTxItem[] = value.map((item) => {
        const id = randomAsNumber();

        return { ...item, id };
      });

      setValues((_values) => ({
        ...(_values || {}),
        [addressHex]: [...(_values?.[addressHex] || []), ...added]
      }));

      if (alert)
        toast.success(<b>New Batch</b>, {
          icon: <IconBatch className='text-primary h-7 w-7' />,
          description: (
            <div className='flex flex-col items-start gap-[5px]'>
              <p>New Transaction has been added</p>
              <button
                className='text-primary underline'
                onClick={() => {
                  setRightSidebarTab('batch');
                  openRightSidebar();
                }}
              >
                View Batch {'>>'}
              </button>
            </div>
          )
        });
    },
    [addressHex, openRightSidebar, setRightSidebarTab, setValues]
  );
  const deleteTx = useCallback(
    (ids: (number | string)[]) => {
      if (!addressHex) return;

      setValues((_values) => ({
        ...(_values || {}),
        [addressHex]: (_values?.[addressHex] || []).filter((item) => !ids.includes(item.id))
      }));
    },
    [addressHex, setValues]
  );
  const setTx = useCallback(
    (txs: BatchTxItem[]) => {
      if (!addressHex) return;

      setValues((_values) => ({
        ...(_values || {}),
        [addressHex]: txs
      }));
    },
    [addressHex, setValues]
  );

  return [txs, addTx, deleteTx, setTx];
}
