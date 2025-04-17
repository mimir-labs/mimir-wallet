// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { BatchTxItem } from '@/hooks/types';

import { useAccount } from '@/accounts/useAccount';
import IconAdd from '@/assets/svg/icon-add.svg?react';
import { InputNetwork } from '@/components';
import { useBatchTxs } from '@/hooks/useBatchTxs';
import { useInputNetwork } from '@/hooks/useInputNetwork';
import { useRef, useState } from 'react';
import DraggableList from 'react-draggable-list';
import { useToggle } from 'react-use';

import { SubApiRoot } from '@mimir-wallet/polkadot-core';
import { Button, Divider, Link } from '@mimir-wallet/ui';

import Actions from './Actions';
import BatchItemDrag from './BatchItemDrag';
import EmptyBatch from './EmptyBatch';
import Restore from './Restore';

function Content({
  address,
  network,
  txs,
  addTx,
  deleteTx,
  setTxs,
  onClose
}: {
  address: string;
  network: string;
  txs: BatchTxItem[];
  addTx: (txs: BatchTxItem[], alert?: boolean) => void;
  deleteTx: (ids: (number | string)[]) => void;
  setTxs: (txs: BatchTxItem[]) => void;
  onClose?: () => void;
}) {
  const [selected, setSelected] = useState<(number | string)[]>([]);
  const [relatedBatches, setRelatedBatches] = useState<number[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <div className='flex-1 overflow-y-auto space-y-2.5 scrollbar-hide'>
        <p>Next Batch</p>
        <div ref={containerRef} style={{ touchAction: 'pan-y' }}>
          <DraggableList
            itemKey='id'
            list={txs.map((item, index) => ({
              ...item,
              index,
              selected,
              from: address,
              network,
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
        </div>
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

      <SubApiRoot network={network}>
        <Actions
          address={address}
          txs={txs}
          selected={selected}
          relatedBatches={relatedBatches}
          setTxs={setTxs}
          deleteTx={deleteTx}
          setSelected={setSelected}
          setRelatedBatches={setRelatedBatches}
          onClose={onClose}
        />
      </SubApiRoot>
    </>
  );
}

function Batch({ address, onClose }: { address: string; onClose?: () => void }) {
  const [, toggleOpen] = useToggle(false);
  const [isRestore, toggleRestore] = useToggle(false);
  const [network, setNetwork] = useInputNetwork();
  const [txs, addTx, deleteTx, setTxs] = useBatchTxs(network, address);

  return (
    <div className='w-[50vw] max-w-[560px] min-w-[320px] h-full'>
      <div className='flex flex-col gap-5 h-full'>
        <div className='flex items-center gap-2 justify-between text-xl font-bold'>
          <span className='flex-1'>Batch</span>

          <Button variant='ghost' onPress={toggleRestore}>
            Restore
          </Button>

          <InputNetwork
            placeholder=' '
            className='max-w-[180px] text-small'
            contentClassName='min-h-[32px] h-[32px]'
            radius='full'
            network={network}
            setNetwork={setNetwork}
          />
        </div>
        <Divider />

        {isRestore ? (
          <Restore network={network} onClose={toggleRestore} />
        ) : txs.length === 0 ? (
          <EmptyBatch onAdd={toggleOpen} onClose={onClose} onHandleRestore={toggleRestore} />
        ) : (
          <Content
            address={address}
            network={network}
            txs={txs}
            addTx={addTx}
            deleteTx={deleteTx}
            setTxs={setTxs}
            onClose={onClose}
          />
        )}
      </div>
    </div>
  );
}

function BatchWrapper({ onClose }: { onClose?: () => void }) {
  const { current } = useAccount();

  if (!current) return null;

  return <Batch address={current} onClose={onClose} />;
}

export default BatchWrapper;
