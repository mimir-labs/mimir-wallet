// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { Registry } from '@polkadot/types/types';
import type { Network } from '@mimir-wallet/polkadot-core';
import type { TemplateInfo } from './types';

import { CopyButton } from '@/components';
import { useEffect, useMemo, useState } from 'react';

import { createBlockRegistry, useAllApis, useNetworks } from '@mimir-wallet/polkadot-core';
import { Button, Checkbox, Divider, Modal, ModalBody, ModalContent, ModalHeader, Spinner } from '@mimir-wallet/ui';

import { useSavedTemplate } from './useSavedTemplate';

interface TemplateMigrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceChain: string;
  destChain: string;
  templates: TemplateInfo[];
  block: number;
  onMigrate: () => void;
}

function TemplateItem({
  registry,
  template,
  isSelected,
  onSelect,
  sourceNetwork
}: {
  registry: Registry;
  isSelected: boolean;
  onSelect: (name: string, selected: boolean) => void;
  template: TemplateInfo;
  sourceNetwork: Network;
}) {
  const call = useMemo(() => {
    try {
      return registry.createType('Call', template.call);
    } catch {
      return null;
    }
  }, [registry, template.call]);

  if (!call) {
    return null;
  }

  return (
    <div className='bg-primary/5 flex items-center gap-2.5 rounded-[10px] p-4'>
      <Checkbox isSelected={isSelected} onValueChange={(selected) => onSelect(template.name, selected)}>
        <div className='flex items-center gap-2.5'>
          <span className='font-medium'>{template.name}</span>
        </div>
      </Checkbox>
      <div className='flex-1' />
      <div className='flex items-center gap-2.5'>
        <img src={sourceNetwork?.icon} alt={sourceNetwork?.name} className='inline h-5 w-5' />
        <span className='text-small'>
          {call.section}.{call.method}
        </span>
        <CopyButton value={template.call} size='sm' />
      </div>
    </div>
  );
}

function Content({
  sourceNetwork,
  sourceRegistry,
  destNetwork,
  destApi,
  destChain,
  templates,
  onMigrate
}: {
  sourceNetwork: Network;
  sourceRegistry: Registry;
  destNetwork: Network;
  destApi: ApiPromise;
  destChain: string;
  templates: TemplateInfo[];
  onMigrate: () => void;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const { addTemplate } = useSavedTemplate(destChain);
  const isCheckAll = selected.length === templates.length;
  const isCheckSome = selected.length > 0 && selected.length < templates.length;

  const handleSelectAll = (checked: boolean) => {
    setSelected(checked ? templates.map((item) => item.name) : []);
  };

  const handleSelectItem = (name: string, selected: boolean) => {
    setSelected((items) => (selected ? [...items, name] : items.filter((item) => item !== name)));
  };

  const handleMigrate = () => {
    const selectedTemplates = templates.filter((template) => selected.includes(template.name));

    selectedTemplates.forEach((template) => {
      try {
        const sourceCall = sourceRegistry.createType('Call', template.call);
        const destCall = destApi.tx[sourceCall.section][sourceCall.method](...sourceCall.args);
        const migratedTemplate: TemplateInfo = {
          name: template.name,
          call: destCall.method.toHex()
        };

        addTemplate(migratedTemplate);
      } catch (error) {
        console.error('Failed to migrate template:', template.name, error);
      }
    });

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

      {/* Template Items */}
      <div className='flex flex-col gap-2.5'>
        {templates.map((template) => (
          <TemplateItem
            key={template.name}
            registry={sourceRegistry}
            template={template}
            isSelected={selected.includes(template.name)}
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

export function TemplateMigrationModal({
  isOpen,
  onClose,
  sourceChain,
  destChain,
  templates,
  block,
  onMigrate
}: TemplateMigrationModalProps) {
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
    <Modal isOpen={isOpen} onClose={onClose} size='lg'>
      <ModalContent>
        <ModalHeader>
          <div className='flex flex-col gap-2.5'>
            <h2 className='text-[20px] font-extrabold'>Migrate Call Templates</h2>
            <p className='text-small'>
              Due to Assethub Migration, some call templates may not work on the new chain. You can migrate them to{' '}
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
              destChain={destChain}
              templates={templates}
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

export default TemplateMigrationModal;
