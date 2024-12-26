// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import {
  Box,
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  IconButton,
  Stack,
  SvgIcon,
  Typography
} from '@mui/material';
import { useRef, useState } from 'react';
import DraggableList from 'react-draggable-list';
import { Link } from 'react-router-dom';
import { useToggle } from 'react-use';

import { useAccount } from '@mimir-wallet/accounts/useAccount';
import IconAdd from '@mimir-wallet/assets/svg/icon-add.svg?react';
import IconClose from '@mimir-wallet/assets/svg/icon-close.svg?react';
import { useApi } from '@mimir-wallet/hooks/useApi';
import { useBatchTxs } from '@mimir-wallet/hooks/useBatchTxs';
import { useTxQueue } from '@mimir-wallet/hooks/useTxQueue';

// import AddNewCache from './AddNewCache';
import BatchItem from './BatchItem';
import EmptyBatch from './EmptyBatch';

function Batch({ onClose }: { onClose?: () => void }) {
  const { api } = useApi();
  const { current } = useAccount();
  const [txs, addTx, deleteTx, setTxs] = useBatchTxs(current);
  const [selected, setSelected] = useState<number[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [, toggleOpen] = useToggle(false);
  const { addQueue } = useTxQueue();

  const isCheckAll = selected.length === txs.length;
  const isCheckSome = selected.length > 0 && selected.length < txs.length;

  return (
    <>
      <Box sx={{ width: '50vw', maxWidth: 560, minWidth: 340, height: '100%', padding: { sm: 2, xs: 1.5 } }}>
        {txs.length === 0 ? (
          <EmptyBatch onAdd={toggleOpen} onClose={onClose} />
        ) : (
          <Stack spacing={2} sx={{ height: '100%' }}>
            <Typography variant='h4' sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              Cache
              {/* <Button color='primary' variant='outlined' onClick={toggleOpen}>
                Add New
              </Button> */}
              <IconButton
                color='inherit'
                onClick={() => {
                  onClose?.();
                }}
              >
                <SvgIcon component={IconClose} inheritViewBox />
              </IconButton>
            </Typography>
            <Divider />

            <Stack sx={{ flex: '1', overflowY: 'auto' }} spacing={1}>
              <Typography>Next Cache</Typography>
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
                      onDelete: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
                        e.stopPropagation();
                        e.preventDefault();

                        setSelected((values) => values.filter((v) => v !== item.id));
                        deleteTx([item.id]);
                      },
                      onCopy: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
                        e.stopPropagation();
                        e.preventDefault();
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
                component={Link}
                to={`/explorer/${encodeURIComponent(`mimir://app/transfer`)}`}
                onClick={onClose}
                color='secondary'
                sx={{ color: 'text.primary' }}
                fullWidth
                startIcon={<SvgIcon component={IconAdd} inheritViewBox />}
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
                disabled={selected.length === 0}
                color='error'
                variant='outlined'
                onClick={() => {
                  setSelected((values) => values.filter((v) => !selected.includes(v)));
                  deleteTx(selected);
                }}
              >
                Delete
              </Button>
              <Button
                color='primary'
                disabled={selected.length === 0}
                onClick={() => {
                  addQueue({
                    accountId: current,
                    call: api.tx.utility.batchAll(
                      txs.filter((item) => selected.includes(item.id)).map(({ calldata }) => calldata)
                    ),
                    website: 'mimir://app/batch',
                    beforeSend: async () => {
                      setTxs(txs.filter((tx) => !selected.includes(tx.id)));
                      setSelected([]);
                    }
                  });
                  onClose?.();
                }}
              >
                Confirm Cache
              </Button>
            </Box>
          </Stack>
        )}
      </Box>

      {/* <AddNewCache
        isOpen={isOpen}
        onClose={toggleOpen}
        onAddTxs={(txs) => {
          addTx(txs, false);
        }}
      /> */}
    </>
  );
}

export default Batch;
