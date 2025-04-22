// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { BatchTxItem } from '@/hooks/types';

import { useAccount } from '@/accounts/useAccount';
import IconAdd from '@/assets/svg/icon-add.svg?react';
import IconClose from '@/assets/svg/icon-close.svg?react';
import { InputNetwork } from '@/components';
import { useBatchTxs } from '@/hooks/useBatchTxs';
import { useInputNetwork } from '@/hooks/useInputNetwork';
import { closestCenter, DndContext, type DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useRef, useState } from 'react';
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

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5
      }
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = txs.findIndex((item) => item.id === active.id);
      const newIndex = txs.findIndex((item) => item.id === over?.id);

      const newItems = arrayMove(txs, oldIndex, newIndex);

      // setItems(newItems);
      setTxs(newItems);
    }
  };

  return (
    <>
      <div className='flex-1 overflow-y-auto space-y-2.5 scrollbar-hide'>
        <p>Next Batch</p>
        <div ref={containerRef} style={{ touchAction: 'pan-y' }}>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={txs.map((item) => item.id)} strategy={verticalListSortingStrategy}>
              <div className='space-y-2.5'>
                {txs.map((item, index) => (
                  <BatchItemDrag
                    key={item.id}
                    {...item}
                    index={index}
                    from={address}
                    network={network}
                    selected={selected}
                    onSelected={(state: boolean) => {
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
                    }}
                    onDelete={() => {
                      setSelected((values) => values.filter((v) => v !== item.id));
                      deleteTx([item.id]);
                    }}
                    onCopy={() => {
                      addTx([item], false);
                    }}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
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

function Batch({
  address,
  network,
  setNetwork,
  onClose
}: {
  address: string;
  network: string;
  setNetwork: (network: string) => void;
  onClose?: () => void;
}) {
  const [, toggleOpen] = useToggle(false);
  const [isRestore, toggleRestore] = useToggle(false);

  const [txs, addTx, deleteTx, setTxs] = useBatchTxs(network, address);

  return (
    <div className='w-[50vw] max-w-[560px] min-w-[320px] h-full'>
      <div className='flex flex-col gap-5 h-full'>
        <div className='flex items-center gap-2 justify-between text-xl font-bold'>
          <span className='flex-1'>{isRestore ? 'Restore Cache Transactions' : 'Batch'}</span>

          {isRestore ? (
            <>
              <Button key='close-restore' isIconOnly color='default' variant='light' onPress={toggleRestore}>
                <IconClose className='w-5 h-5' />
              </Button>
            </>
          ) : (
            <>
              <Button key='open-restore' variant='ghost' onPress={toggleRestore}>
                Restore
              </Button>

              <InputNetwork
                isIconOnly
                placeholder=' '
                className='max-w-[60px] text-small'
                contentClassName='min-h-[32px] h-[32px]'
                radius='full'
                network={network}
                setNetwork={setNetwork}
              />
            </>
          )}
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
  const [network, setNetwork] = useInputNetwork();

  if (!current) return null;

  return (
    <Batch
      key={`batch-${current}-${network}`}
      address={current}
      network={network}
      setNetwork={setNetwork}
      onClose={onClose}
    />
  );
}

export default BatchWrapper;
