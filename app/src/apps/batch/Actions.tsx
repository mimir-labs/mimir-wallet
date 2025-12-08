// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { BatchTxItem } from '@/hooks/types';
import type { Registry } from '@polkadot/types/types';

import { ApiManager, useNetwork } from '@mimir-wallet/polkadot-core';
import { Button, Checkbox } from '@mimir-wallet/ui';
import React, { useMemo } from 'react';

import { filterOutBatchAllTransactions } from './utils';

import { analyticsActions } from '@/analytics';
import { TxButton } from '@/components';

function Actions({
  address,
  txs,
  selected,
  relatedBatches,
  registry,
  setTxs,
  deleteTx,
  setSelected,
  setRelatedBatches,
  onClose,
}: {
  address: string;
  txs: BatchTxItem[];
  selected: (string | number)[];
  relatedBatches: number[];
  registry: Registry | null;
  setTxs: (txs: BatchTxItem[]) => void;
  deleteTx: (ids: (number | string)[]) => void;
  setSelected: React.Dispatch<React.SetStateAction<(string | number)[]>>;
  setRelatedBatches: (relatedBatches: number[]) => void;
  onClose?: () => void;
}) {
  const { network } = useNetwork();

  // Filter out batchAll transactions for select all
  const selectableTxs = useMemo(
    () => (registry ? filterOutBatchAllTransactions(txs, registry) : []),
    [txs, registry],
  );

  const isCheckAll =
    selectableTxs.length > 0 && selected.length === selectableTxs.length;
  const isCheckSome =
    selected.length > 0 && selected.length < selectableTxs.length;

  return (
    <div className="flex gap-5">
      <div className="flex flex-1 items-center pl-2">
        <label className="inline-flex cursor-pointer items-center gap-2">
          <Checkbox
            checked={isCheckSome ? 'indeterminate' : isCheckAll}
            onCheckedChange={(checked) => {
              if (checked) {
                // Track batch interacted when selecting all
                analyticsActions.batchInteracted();
                // Only select non-batchAll transactions
                setSelected(selectableTxs.map((item) => item.id));
                setRelatedBatches(
                  selectableTxs
                    .map((item) => item.relatedBatch)
                    .filter((item) => item !== undefined),
                );
              } else {
                setSelected([]);
                setRelatedBatches([]);
              }
            }}
          />
          <span>All</span>
        </label>
      </div>
      <Button
        disabled={selected.length === 0}
        color="danger"
        variant="ghost"
        onClick={() => {
          setSelected((values) => values.filter((v) => !selected.includes(v)));
          deleteTx(selected);
        }}
      >
        Delete
      </Button>
      <TxButton
        color="primary"
        disabled={selected.length === 0}
        relatedBatches={relatedBatches}
        accountId={address}
        website="mimir://app/batch"
        beforeSend={async () => {
          try {
            setTxs(txs.filter((tx) => !selected.includes(tx.id)));
            setSelected([]);
          } catch (error) {
            console.error('Failed to update transactions state:', error);

            throw error;
          }
        }}
        getCall={async () => {
          try {
            const api = await ApiManager.getInstance().getApi(network, true);

            const selectedTxs = txs.filter((item) =>
              selected.includes(item.id),
            );

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
        onDone={() => {
          // Track batch success
          analyticsActions.batchSuccess(selected.length);
          onClose?.();
        }}
      >
        Confirm Batch
      </TxButton>
    </div>
  );
}

export default React.memo(Actions);
