// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { BatchTxItem } from '@/hooks/types';

import { TxButton } from '@/components';
import React, { useMemo } from 'react';

import { useApi } from '@mimir-wallet/polkadot-core';
import { Button, Checkbox } from '@mimir-wallet/ui';

import { filterOutBatchAllTransactions } from './utils';

function Actions({
  address,
  txs,
  selected,
  relatedBatches,
  setTxs,
  deleteTx,
  setSelected,
  setRelatedBatches,
  onClose
}: {
  address: string;
  txs: BatchTxItem[];
  selected: (string | number)[];
  relatedBatches: number[];
  setTxs: (txs: BatchTxItem[]) => void;
  deleteTx: (ids: (number | string)[]) => void;
  setSelected: React.Dispatch<React.SetStateAction<(string | number)[]>>;
  setRelatedBatches: (relatedBatches: number[]) => void;
  onClose?: () => void;
}) {
  const { api } = useApi();

  // Filter out batchAll transactions for select all
  const selectableTxs = useMemo(() => filterOutBatchAllTransactions(txs, api.registry), [txs, api.registry]);

  const isCheckAll = selectableTxs.length > 0 && selected.length === selectableTxs.length;
  const isCheckSome = selected.length > 0 && selected.length < selectableTxs.length;

  return (
    <div className='flex gap-5'>
      <div className='flex flex-1 items-center pl-2'>
        <Checkbox
          size='sm'
          isSelected={isCheckAll || isCheckSome}
          isIndeterminate={isCheckSome}
          onValueChange={(checked) => {
            if (checked) {
              // Only select non-batchAll transactions
              setSelected(selectableTxs.map((item) => item.id));
              setRelatedBatches(selectableTxs.map((item) => item.relatedBatch).filter((item) => item !== undefined));
            } else {
              setSelected([]);
              setRelatedBatches([]);
            }
          }}
        >
          All
        </Checkbox>
      </div>
      <Button
        disabled={selected.length === 0}
        color='danger'
        variant='ghost'
        onClick={() => {
          setSelected((values) => values.filter((v) => !selected.includes(v)));
          deleteTx(selected);
        }}
      >
        Delete
      </Button>
      <TxButton
        color='primary'
        disabled={selected.length === 0}
        relatedBatches={relatedBatches}
        accountId={address}
        website='mimir://app/batch'
        beforeSend={async () => {
          try {
            setTxs(txs.filter((tx) => !selected.includes(tx.id)));
            setSelected([]);
          } catch (error) {
            console.error('Failed to update transactions state:', error);

            throw error;
          }
        }}
        getCall={() => {
          try {
            const selectedTxs = txs.filter((item) => selected.includes(item.id));

            if (selectedTxs.length === 0) {
              throw new Error('No transactions selected');
            }

            const calls = selectedTxs.map(({ calldata }) => {
              if (!calldata) {
                throw new Error('Invalid transaction data');
              }

              return calldata;
            });

            // If only one transaction is selected, submit it directly without utility.batchAll wrapper
            if (calls.length === 1) {
              return calls[0];
            }

            // Otherwise, wrap multiple transactions with utility.batchAll
            return api.tx.utility.batchAll(calls);
          } catch (error) {
            console.error('Failed to prepare batch transaction:', error);

            throw error;
          }
        }}
        onDone={onClose}
      >
        Confirm Batch
      </TxButton>
    </div>
  );
}

export default React.memo(Actions);
