// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useAccount } from '@/accounts/useAccount';
import IconAdd from '@/assets/svg/icon-add.svg?react';
import { TxButton } from '@/components';
import { useApi } from '@/hooks/useApi';
import { useBatchTxs } from '@/hooks/useBatchTxs';
import { Box } from '@mui/material';
import { useRef, useState } from 'react';
import DraggableList from 'react-draggable-list';
import { useToggle } from 'react-use';

import { Button, Checkbox, Divider, Link } from '@mimir-wallet/ui';

import BatchItemDrag from './BatchItemDrag';
import EmptyBatch from './EmptyBatch';
import Restore from './Restore';

function Batch({ onClose }: { onClose?: () => void }) {
  const { api } = useApi();
  const { current } = useAccount();
  const [txs, addTx, deleteTx, setTxs] = useBatchTxs(current);
  const [selected, setSelected] = useState<(number | string)[]>([]);
  const [relatedBatches, setRelatedBatches] = useState<number[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [, toggleOpen] = useToggle(false);
  const [isRestore, toggleRestore] = useToggle(false);

  const isCheckAll = selected.length === txs.length;
  const isCheckSome = selected.length > 0 && selected.length < txs.length;

  return (
    <div className='w-[50vw] max-w-[560px] min-w-[320px] h-full'>
      {isRestore ? (
        <Restore onClose={toggleRestore} />
      ) : txs.length === 0 ? (
        <EmptyBatch onAdd={toggleOpen} onClose={onClose} onHandleRestore={toggleRestore} />
      ) : (
        <div className='flex flex-col gap-5 h-full'>
          <div className='flex items-center justify-between text-xl font-bold'>
            Batch
            {/* <Button variant='ghost' onPress={toggleRestore}>
              Restore
            </Button> */}
            {/* <Button color='primary' variant='outlined' onClick={toggleOpen}>
                Add New
              </Button> */}
          </div>
          <Divider />

          <div className='flex-1 overflow-y-auto space-y-2.5'>
            <p>Next Batch</p>
            {current && (
              <Box ref={containerRef} style={{ touchAction: 'pan-y' }}>
                <DraggableList
                  itemKey='id'
                  list={txs.map((item, index) => ({
                    ...item,
                    index,
                    selected,
                    from: current,
                    onSelected: (state: boolean) => {
                      setSelected((values) => (state ? [...values, item.id] : values.filter((v) => item.id !== v)));
                      setRelatedBatches((values) =>
                        state
                          ? item.relatedBatch
                            ? [...values, item.relatedBatch]
                            : values
                          : item.relatedBatch
                            ? values.filter((v) => item.relatedBatch !== v)
                            : values
                      );
                    },
                    onDelete: () => {
                      setSelected((values) => values.filter((v) => v !== item.id));
                      deleteTx([item.id]);
                    },
                    onCopy: () => {
                      addTx([item], false);
                    }
                  }))}
                  template={BatchItemDrag as any}
                  onMoveEnd={setTxs as any}
                  container={() => containerRef.current}
                />
              </Box>
            )}
            <Button
              as={Link}
              href={`/explorer/${encodeURIComponent('mimir://app/transfer')}`}
              onPress={onClose}
              color='secondary'
              fullWidth
              radius='md'
              startContent={<IconAdd className='w-4 h-4' />}
              className='text-foreground'
            >
              Add New Transfer
            </Button>
          </div>

          <Divider />

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Box sx={{ flex: '1', display: 'flex', alignItems: 'center' }}>
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
            </Box>
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
              accountId={current}
              website='mimir://app/batch'
              beforeSend={async () => {
                setTxs(txs.filter((tx) => !selected.includes(tx.id)));
                setSelected([]);
              }}
              getCall={() =>
                api.tx.utility.batchAll(
                  txs.filter((item) => selected.includes(item.id)).map(({ calldata }) => calldata)
                )
              }
              onDone={onClose}
            >
              Confirm Batch
            </TxButton>
          </Box>
        </div>
      )}
    </div>
  );
}

export default Batch;
