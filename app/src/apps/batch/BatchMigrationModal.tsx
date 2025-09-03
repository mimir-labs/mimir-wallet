// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { BatchTxItem } from '@/hooks/types';
import type { ApiPromise } from '@polkadot/api';
import type { Registry } from '@polkadot/types/types';
import type { HexString } from '@polkadot/util/types';
import type { Network } from '@mimir-wallet/polkadot-core';

import { CopyButton } from '@/components';
import { useBatchTxs } from '@/hooks/useBatchTxs';
import { useEffect, useMemo, useState } from 'react';

import { createBlockRegistry, useAllApis, useNetworks } from '@mimir-wallet/polkadot-core';
import { Button, Checkbox, Divider, Modal, ModalBody, ModalContent, ModalHeader, Spinner } from '@mimir-wallet/ui';

interface BatchMigrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceChain: string;
  destChain: string;
  batchList: BatchTxItem[];
  block: number;
  address: string;
  onMigrate: () => void;
}

function Item({
  registry,
  id,
  calldata,
  isSelected,
  onSelect,
  sourceNetwork
}: {
  registry: Registry;
  isSelected: boolean;
  onSelect: (id: number, selected: boolean) => void;
  id: number;
  calldata: HexString;
  sourceNetwork: Network;
}) {
  const call = useMemo(() => {
    try {
      return registry.createType('Call', calldata);
    } catch {
      return null;
    }
  }, [registry, calldata]);

  if (!call) {
    return null;
  }

  return (
    <div key={id} className='bg-primary/5 flex items-center gap-2.5 rounded-[10px] p-4'>
      <Checkbox isSelected={isSelected} onValueChange={(selected) => onSelect(id, selected)}>
        <div className='flex items-center gap-2.5'>
          <img src={sourceNetwork?.icon} alt={sourceNetwork?.name} className='inline h-5 w-5' />
          {call.section}.{call.method}
        </div>
      </Checkbox>
      <CopyButton value={calldata} size='sm' />
    </div>
  );
}

function Content({
  sourceNetwork,
  sourceRegistry,
  destNetwork,
  destApi,
  calls,
  address,
  onMigrate
}: {
  sourceNetwork: Network;
  sourceRegistry: Registry;
  destNetwork: Network;
  destApi: ApiPromise;
  calls: Array<BatchTxItem>;
  address: string;
  onMigrate: () => void;
}) {
  const [selected, setSelected] = useState<number[]>([]);
  const isCheckAll = selected.length === calls.length;
  const isCheckSome = selected.length > 0 && selected.length < calls.length;

  const [, addTx] = useBatchTxs(destNetwork.key, address);

  const handleSelectAll = (checked: boolean) => {
    setSelected(checked ? calls.map((item) => item.id) : []);
  };

  const handleSelectItem = (id: number, selected: boolean) => {
    setSelected((items) => (selected ? [...items, id] : items.filter((item) => item !== id)));
  };

  const handleMigrate = () => {
    const selectedCalls = calls.filter((item) => selected.includes(item.id));

    const migrationCalls: Omit<BatchTxItem, 'id'>[] = [];

    selectedCalls.forEach((item) => {
      try {
        const sourceCall = sourceRegistry.createType('Call', item.calldata);
        const destCall = destApi.tx[sourceCall.section][sourceCall.method](...sourceCall.args);
        const migratedBatch: Omit<BatchTxItem, 'id'> = {
          ...item,
          calldata: destCall.method.toHex()
        };

        migrationCalls.push(migratedBatch);
      } catch (error) {
        console.error('Failed to migrate template:', item.id, error);
      }
    });

    addTx(migrationCalls, false);
    onMigrate();
  };

  return (
    <div className='flex w-full flex-col gap-[15px]'>
      {/* Divider */}
      <Divider />

      {/* Chain Migration Path */}
      <div className='flex items-center gap-2.5 py-1'>
        <div className='h-6 w-6 overflow-hidden rounded-full'>
          <img src={sourceNetwork?.icon} alt={sourceNetwork?.name} className='h-full w-full object-cover' />
        </div>
        <span className='text-foreground text-[18px] font-extrabold whitespace-nowrap'>{sourceNetwork?.name}</span>
        <svg
          xmlns='http://www.w3.org/2000/svg'
          width='16'
          height='16'
          viewBox='0 0 16 16'
          fill='none'
          className='text-primary'
        >
          <path
            d='M3 5.00039V11.0004C3 11.133 2.94732 11.2602 2.85355 11.3539C2.75979 11.4477 2.63261 11.5004 2.5 11.5004C2.36739 11.5004 2.24021 11.4477 2.14645 11.3539C2.05268 11.2602 2 11.133 2 11.0004V5.00039C2 4.86779 2.05268 4.74061 2.14645 4.64684C2.24021 4.55307 2.36739 4.50039 2.5 4.50039C2.63261 4.50039 2.75979 4.55307 2.85355 4.64684C2.94732 4.74061 3 4.86779 3 5.00039ZM14.8538 7.64664L8.85375 1.64664C8.78382 1.57664 8.6947 1.52895 8.59765 1.50963C8.50061 1.4903 8.40002 1.50021 8.30861 1.53808C8.21719 1.57596 8.13908 1.64011 8.08414 1.7224C8.0292 1.8047 7.99992 1.90145 8 2.00039V4.50039H4.5C4.36739 4.50039 4.24021 4.55307 4.14645 4.64684C4.05268 4.74061 4 4.86779 4 5.00039V11.0004C4 11.133 4.05268 11.2602 4.14645 11.3539C4.24021 11.4477 4.36739 11.5004 4.5 11.5004H8V14.0004C7.99992 14.0993 8.0292 14.1961 8.08414 14.2784C8.13908 14.3607 8.21719 14.4248 8.30861 14.4627C8.40002 14.5006 8.50061 14.5105 8.59765 14.4912C8.6947 14.4718 8.78382 14.4241 8.85375 14.3541L14.8538 8.35414C14.9002 8.30771 14.9371 8.25256 14.9623 8.19186C14.9874 8.13117 15.0004 8.0661 15.0004 8.00039C15.0004 7.93469 14.9874 7.86962 14.9623 7.80892C14.9371 7.74822 14.9002 7.69308 14.8538 7.64664Z'
            fill='currentColor'
          />
        </svg>
        <div className='h-6 w-6 overflow-hidden rounded-full'>
          <img src={destNetwork?.icon} alt={destNetwork?.name} className='h-full w-full object-cover' />
        </div>
        <span className='text-foreground text-[18px] font-extrabold whitespace-nowrap'>{destNetwork?.name}</span>
      </div>

      {/* Batch Items */}
      <div className='flex flex-col gap-2.5'>
        {calls.map((item) => (
          <Item
            key={item.id}
            registry={sourceRegistry}
            id={item.id}
            calldata={item.calldata}
            isSelected={selected.includes(item.id)}
            onSelect={handleSelectItem}
            sourceNetwork={sourceNetwork}
          />
        ))}
      </div>

      <Divider />

      {/* Select All */}
      <Checkbox isSelected={isCheckAll || isCheckSome} isIndeterminate={isCheckSome} onValueChange={handleSelectAll}>
        All
      </Checkbox>

      {/* Migrate Button */}
      <Button color='primary' disabled={selected.length === 0} fullWidth onClick={handleMigrate}>
        Migrate ({selected.length})
      </Button>
    </div>
  );
}

export function BatchMigrationModal({
  isOpen,
  onClose,
  sourceChain,
  destChain,
  batchList,
  block,
  onMigrate,
  address
}: BatchMigrationModalProps) {
  const { networks, enableNetwork } = useNetworks();
  const { chains } = useAllApis();
  const [registry, setRegistry] = useState<Registry | null>(null);

  const sourceReady = !!chains[sourceChain]?.isApiReady;
  const destReady = !!chains[destChain]?.isApiReady;
  const destApi = chains[destChain]?.api;

  const sourceNetwork = networks.find((network) => network.key === sourceChain);
  const destNetwork = networks.find((network) => network.key === destChain);

  useEffect(() => {
    if (isOpen) {
      enableNetwork(sourceChain);
      enableNetwork(destChain);
    }
  }, [enableNetwork, sourceChain, destChain, isOpen]);

  // Create registry for parsing calls
  useEffect(() => {
    if (block && chains[sourceChain]?.api) {
      const api = chains[sourceChain].api!;

      createBlockRegistry(api, block).then((registry) => {
        setRegistry(registry);
      });
    }
  }, [block, sourceChain, destChain, chains]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size='xl'>
      <ModalContent>
        <ModalHeader>
          <div className='flex flex-col gap-2.5'>
            <h2 className='text-[20px] font-extrabold'>Fast Copy Batch</h2>
            <p className='text-small'>
              Due to Assethub Migration, some of batch couldn&apos;t be used any more. You can migrate them to{' '}
              {destNetwork?.name}.
            </p>
          </div>
        </ModalHeader>

        <ModalBody>
          {sourceReady && sourceNetwork && destReady && destNetwork && destApi && registry ? (
            <Content
              sourceNetwork={sourceNetwork}
              sourceRegistry={registry}
              destNetwork={destNetwork}
              destApi={destApi}
              calls={batchList}
              address={address}
              onMigrate={onMigrate}
            />
          ) : (
            <div className='flex h-[100px] w-full items-center justify-center'>
              <Spinner />
            </div>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
