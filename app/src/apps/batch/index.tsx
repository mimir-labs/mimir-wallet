// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useAccount } from '@/accounts/useAccount';
import IconAdd from '@/assets/svg/icon-add.svg?react';
import { TxButton } from '@/components';
import { useApi } from '@/hooks/useApi';
import { useBatchTxs } from '@/hooks/useBatchTxs';
import { Box, Checkbox, Divider, FormControlLabel, Stack } from '@mui/material';
import { useRef, useState } from 'react';
import DraggableList from 'react-draggable-list';
import { Link } from 'react-router-dom';
import { useToggle } from 'react-use';

import { Button } from '@mimir-wallet/ui';

import BatchItem from './BatchItem';
import EmptyBatch from './EmptyBatch';

function Batch({ onClose }: { onClose?: () => void }) {
  const { api } = useApi();
  const { current } = useAccount();
  const [txs, addTx, deleteTx, setTxs] = useBatchTxs(current);
  const [selected, setSelected] = useState<number[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [, toggleOpen] = useToggle(false);

  const isCheckAll = selected.length === txs.length;
  const isCheckSome = selected.length > 0 && selected.length < txs.length;

  return (
    <>
      <Box sx={{ width: '50vw', maxWidth: 560, minWidth: 320, height: '100%' }}>
        {txs.length === 0 ? (
          <EmptyBatch onAdd={toggleOpen} onClose={onClose} />
        ) : (
          <Stack spacing={2} sx={{ height: '100%' }}>
            <div className='flex items-center justify-between text-xl font-bold'>
              Batch
              {/* <Button color='primary' variant='outlined' onClick={toggleOpen}>
                Add New
              </Button> */}
            </div>
            <Divider />

            <Stack sx={{ flex: '1', overflowY: 'auto' }} spacing={1}>
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
                      onSelected: (state: boolean) =>
                        setSelected((values) => (state ? [...values, item.id] : values.filter((v) => item.id !== v))),
                      onDelete: () => {
                        setSelected((values) => values.filter((v) => v !== item.id));
                        deleteTx([item.id]);
                      },
                      onCopy: () => {
                        addTx([item], false);
                      }
                    }))}
                    template={BatchItem as any}
                    onMoveEnd={setTxs as any}
                    container={() => containerRef.current}
                  />
                </Box>
              )}
              <Button
                as={Link}
                to={`/explorer/${encodeURIComponent('mimir://app/transfer')}`}
                onPress={onClose}
                color='secondary'
                fullWidth
                startContent={<IconAdd className='w-4 h-4' />}
                className='text-foreground'
              >
                Add New Transfer
              </Button>
            </Stack>

            <Divider />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Box sx={{ flex: '1', display: 'flex', alignItems: 'center' }}>
                <FormControlLabel
                  label='All'
                  control={
                    <Checkbox
                      checked={isCheckAll || isCheckSome}
                      indeterminate={isCheckSome}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelected(txs.map((item) => item.id));
                        } else {
                          setSelected([]);
                        }
                      }}
                    />
                  }
                />
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
          </Stack>
        )}
      </Box>
    </>
  );
}

export default Batch;
