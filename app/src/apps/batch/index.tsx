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
import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useToggle } from 'react-use';

import { SubApiRoot, useApi, useNetworks } from '@mimir-wallet/polkadot-core';
import { Avatar, Button, Divider } from '@mimir-wallet/ui';

import Actions from './Actions';
import BatchItemDrag from './BatchItemDrag';
import EmptyBatch from './EmptyBatch';
import Restore from './Restore';

function Content({
  address,
  txs,
  addTx,
  deleteTx,
  setTxs,
  onClose
}: {
  address: string;
  txs: BatchTxItem[];
  addTx: (txs: BatchTxItem[], alert?: boolean) => void;
  deleteTx: (ids: (number | string)[]) => void;
  setTxs: (txs: BatchTxItem[]) => void;
  onClose?: () => void;
}) {
  const { api } = useApi();
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
      <div className='scrollbar-hide flex flex-1 flex-col gap-2.5 overflow-y-auto'>
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
                    selected={selected}
                    registry={api.registry}
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
        <Button asChild color='secondary' fullWidth radius='md' className='text-foreground flex-shrink-0'>
          <Link to={`/explorer/${encodeURIComponent('mimir://app/transfer')}`} onClick={onClose}>
            <IconAdd className='h-4 w-4' />
            Add New Transfer
          </Link>
        </Button>
      </div>

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
  const { networks } = useNetworks();

  const [txs, addTx, deleteTx, setTxs] = useBatchTxs(network, address);

  const networkChain = useMemo(() => networks.find((n) => n.key === network), [networks, network]);

  return (
    <div className='flex h-full w-[50vw] max-w-[560px] min-w-[320px] flex-col gap-5'>
      <div className='flex items-center justify-between gap-2 text-xl font-bold'>
        {isRestore ? (
          <span className='inline-flex flex-1 items-center gap-2'>
            <Avatar style={{ width: 20, height: 20, background: 'transparent' }} src={networkChain?.icon} />
            Restore Cache Transactions
          </span>
        ) : (
          <span className='flex-1'>Batch</span>
        )}

        {isRestore ? (
          <>
            <Button key='close-restore' isIconOnly className='text-inherit' variant='light' onClick={toggleRestore}>
              <IconClose className='h-5 w-5' />
            </Button>
          </>
        ) : (
          <>
            <Button key='open-restore' variant='ghost' onClick={toggleRestore}>
              Restore
            </Button>

            <InputNetwork
              isIconOnly
              placeholder=' '
              className='max-w-[60px] text-sm'
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
        <SubApiRoot network={network}>
          <Restore onClose={toggleRestore} />
        </SubApiRoot>
      ) : txs.length === 0 ? (
        <EmptyBatch onAdd={toggleOpen} onClose={onClose} onHandleRestore={toggleRestore} />
      ) : (
        <SubApiRoot network={network}>
          <Content address={address} txs={txs} addTx={addTx} deleteTx={deleteTx} setTxs={setTxs} onClose={onClose} />
        </SubApiRoot>
      )}
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
