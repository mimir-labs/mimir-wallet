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
import { useCallback, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useToggle } from 'react-use';

import { SubApiRoot, useApi, useNetworks } from '@mimir-wallet/polkadot-core';
import { Avatar, Button } from '@mimir-wallet/ui';

import Actions from './Actions';
import BatchItemDrag from './BatchItemDrag';
import BatchMigrationAlert from './BatchMigrationAlert';
import EmptyBatch from './EmptyBatch';
import LazyRestore from './LazyRestore';
import { calculateSelectionConstraints } from './utils';

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
  const { api, network } = useApi();
  const [selected, setSelected] = useState<(number | string)[]>([]);
  const [relatedBatches, setRelatedBatches] = useState<number[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Track selected transactions
  const selectedTxs = useMemo(() => {
    return txs.filter((tx) => selected.includes(tx.id));
  }, [txs, selected]);

  // Memoize IDs for SortableContext to prevent recreation
  const sortableItems = useMemo(() => txs.map((item) => item.id), [txs]);

  // Memoize handlers to prevent unnecessary re-renders
  const handleItemSelection = useCallback((itemId: number | string, relatedBatch?: number) => {
    return (state: boolean) => {
      setSelected((values) => (state ? [...values, itemId] : values.filter((v) => itemId !== v)));
      setRelatedBatches((values) =>
        state
          ? relatedBatch
            ? [...values, relatedBatch]
            : values
          : relatedBatch
            ? values.filter((v) => relatedBatch !== v)
            : values
      );
    };
  }, []);

  const handleItemDelete = useCallback(
    (itemId: number | string) => {
      return () => {
        setSelected((values) => values.filter((v) => v !== itemId));
        deleteTx([itemId]);
      };
    },
    [deleteTx]
  );

  const handleItemCopy = useCallback(
    (item: BatchTxItem) => {
      return () => {
        addTx([item], false);
      };
    },
    [addTx]
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5
      }
    })
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (active.id !== over?.id) {
        const oldIndex = txs.findIndex((item) => item.id === active.id);
        const newIndex = txs.findIndex((item) => item.id === over?.id);

        if (oldIndex !== -1 && newIndex !== -1) {
          const newItems = arrayMove(txs, oldIndex, newIndex);

          setTxs(newItems);
        }
      }
    },
    [txs, setTxs]
  );

  const handleMigrationComplete = () => {
    // Refresh batch after migration is complete
    // The batch list will automatically update via the useBatchTxs hook
  };

  return (
    <>
      <div className='scrollbar-hide flex flex-1 flex-col gap-2.5 overflow-y-auto'>
        <BatchMigrationAlert
          chain={network}
          txs={txs}
          address={address}
          onMigrationComplete={handleMigrationComplete}
        />

        <div ref={containerRef} style={{ touchAction: 'pan-y' }}>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={sortableItems} strategy={verticalListSortingStrategy}>
              <div className='space-y-2.5'>
                {txs.map((item, index) => {
                  const { isDisabled, disabledReason } = calculateSelectionConstraints(
                    item,
                    selectedTxs,
                    api.registry,
                    selected.includes(item.id)
                  );

                  return (
                    <BatchItemDrag
                      key={item.id}
                      {...item}
                      index={index}
                      from={address}
                      selected={selected}
                      registry={api.registry}
                      isSelectionDisabled={isDisabled}
                      disabledReason={disabledReason}
                      onSelected={isDisabled ? () => {} : handleItemSelection(item.id, item.relatedBatch)}
                      onDelete={handleItemDelete(item.id)}
                      onCopy={handleItemCopy(item)}
                    />
                  );
                })}
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
    <div className='flex h-full w-full flex-col gap-5'>
      <div className='flex gap-4'>
        <InputNetwork
          placeholder=' '
          contentClassName='min-h-[32px] h-[32px]'
          radius='full'
          network={network}
          setNetwork={setNetwork}
        />
        {isRestore ? null : (
          <Button variant='ghost' onClick={toggleRestore}>
            Restore
          </Button>
        )}
      </div>
      {isRestore ? (
        <div className='flex items-center justify-between gap-2 text-xl font-bold'>
          <span className='inline-flex flex-1 items-center gap-2'>
            <Avatar style={{ width: 20, height: 20, background: 'transparent' }} src={networkChain?.icon} />
            Restore Cache Transactions
          </span>

          <Button key='close-restore' isIconOnly className='text-inherit' variant='light' onClick={toggleRestore}>
            <IconClose className='h-5 w-5' />
          </Button>
        </div>
      ) : null}

      {isRestore ? (
        <SubApiRoot network={network}>
          <LazyRestore onClose={toggleRestore} />
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
