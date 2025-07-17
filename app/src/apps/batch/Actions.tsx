// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { BatchTxItem } from '@/hooks/types';

import { TxButton } from '@/components';
import React from 'react';

import { useApi } from '@mimir-wallet/polkadot-core';
import { Button, Checkbox } from '@mimir-wallet/ui';

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
  const isCheckAll = selected.length === txs.length;
  const isCheckSome = selected.length > 0 && selected.length < txs.length;

  return (
    <div className='flex gap-5'>
      <div className='flex flex-1 items-center pl-2'>
        <Checkbox
          size='sm'
          isSelected={isCheckAll || isCheckSome}
          isIndeterminate={isCheckSome}
          onValueChange={(checked) => {
            if (checked) {
              setSelected(txs.map((item) => item.id));
              setRelatedBatches(txs.map((item) => item.relatedBatch).filter((item) => item !== undefined));
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
        isDisabled={selected.length === 0}
        color='danger'
        variant='ghost'
        onPress={() => {
          setSelected((values) => values.filter((v) => !selected.includes(v)));
          deleteTx(selected);
        }}
      >
        Delete
      </Button>
      <TxButton
        color='primary'
        isDisabled={selected.length === 0}
        relatedBatches={relatedBatches}
        accountId={address}
        website='mimir://app/batch'
        beforeSend={async () => {
          setTxs(txs.filter((tx) => !selected.includes(tx.id)));
          setSelected([]);
        }}
        getCall={() =>
          api.tx.utility.batchAll(txs.filter((item) => selected.includes(item.id)).map(({ calldata }) => calldata))
        }
        onDone={onClose}
      >
        Confirm Batch
      </TxButton>
    </div>
  );
}

export default React.memo(Actions);
