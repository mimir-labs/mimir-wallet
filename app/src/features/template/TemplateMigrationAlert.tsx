// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { TemplateInfo } from './types';

import IconClose from '@/assets/svg/icon-close.svg?react';
import { toastSuccess } from '@/components/utils';
import {
  useNetworkMigrationCompleted,
  useTemplateMigrationStatus
} from '@/features/assethub-migration/useMigrationStatus';
import { useState } from 'react';

import { useNetworks } from '@mimir-wallet/polkadot-core';
import { Alert, AlertTitle, Button } from '@mimir-wallet/ui';

import TemplateMigrationModal from './TemplateMigrationModal';

interface TemplateMigrationAlertProps {
  chain: string;
  templates: TemplateInfo[];
  onMigrationComplete?: () => void;
}

function TemplateMigrationAlert({ chain, templates, onMigrationComplete }: TemplateMigrationAlertProps) {
  const { isAlertVisible, dismissAlert } = useTemplateMigrationStatus(chain);
  const [isMigrationModalOpen, setIsMigrationModalOpen] = useState(false);
  const { networks } = useNetworks();
  const migrationCompleted = useNetworkMigrationCompleted(chain);

  if (!isAlertVisible || !migrationCompleted.completed || !migrationCompleted.block || !migrationCompleted.destChain) {
    return null;
  }

  const destNetwork = networks.find((network) => network.key === migrationCompleted.destChain);

  const handleMigrationComplete = () => {
    dismissAlert();
    toastSuccess('Template migration completed');
    onMigrationComplete?.();
  };

  return (
    <>
      <Alert className='grow-0' variant='warning'>
        <AlertTitle className='relative flex items-center'>
          <span className='font-normal'>
            Due to the Assethub Migration, you can copy Batch to{' '}
            <img
              draggable={false}
              style={{ display: 'inline', width: '1em', height: '1em', verticalAlign: 'middle', userSelect: 'none' }}
              src={destNetwork?.icon}
            />{' '}
            {destNetwork?.name}.{' '}
            <button className='text-primary cursor-pointer' onClick={() => setIsMigrationModalOpen(true)}>
              View The List{'>>'}
            </button>
          </span>

          <Button size='sm' className='absolute right-0 text-inherit' isIconOnly variant='light' onClick={dismissAlert}>
            <IconClose className='h-5 w-5' />
          </Button>
        </AlertTitle>
      </Alert>

      <TemplateMigrationModal
        isOpen={isMigrationModalOpen}
        onClose={() => setIsMigrationModalOpen(false)}
        sourceChain={chain}
        destChain={migrationCompleted.destChain}
        templates={templates}
        block={migrationCompleted.block}
        onMigrate={handleMigrationComplete}
      />
    </>
  );
}

export default TemplateMigrationAlert;
