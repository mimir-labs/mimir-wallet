// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { BatchTxItem } from '@/hooks/types';

import IconClose from '@/assets/svg/icon-close.svg?react';
import { toastSuccess } from '@/components/utils';
import {
  useBatchMigrationStatus,
  useNetworkMigrationCompleted
} from '@/features/assethub-migration/useMigrationStatus';
import { useState } from 'react';

import { useNetworks } from '@mimir-wallet/polkadot-core';
import { Alert, Button, Link } from '@mimir-wallet/ui';

import { BatchMigrationModal } from './BatchMigrationModal';

function BatchMigrationAlert({
  chain,
  txs,
  address,
  onMigrationComplete
}: {
  chain: string;
  txs: BatchTxItem[];
  address: string;
  onMigrationComplete?: () => void;
}) {
  const { isAlertVisible, dismissAlert } = useBatchMigrationStatus(chain, address);
  const [isMigrationModalOpen, setIsMigrationModalOpen] = useState(false);
  const { networks } = useNetworks();
  const migrationCompleted = useNetworkMigrationCompleted(chain);

  if (!isAlertVisible || !migrationCompleted.completed || !migrationCompleted.block || !migrationCompleted.destChain) {
    return null;
  }

  const destNetwork = networks.find((network) => network.key === migrationCompleted.destChain);

  const handleMigrationComplete = () => {
    dismissAlert();
    toastSuccess('Batch migration completed');
    onMigrationComplete?.();
  };

  return (
    <>
      <Alert
        classNames={{ base: 'flex-grow-0' }}
        color='warning'
        title={
          <div className='flex items-center'>
            <span className='font-normal'>
              Due to the Assethub Migration, you can copy Batch to{' '}
              <img
                draggable={false}
                style={{ display: 'inline', width: '1em', height: '1em', userSelect: 'none' }}
                src={destNetwork?.icon}
              />{' '}
              {destNetwork?.name}.{' '}
              <Link as='button' onPress={() => setIsMigrationModalOpen(true)}>
                View The List{'>>'}
              </Link>
            </span>

            <Button className='flex-shrink-0' isIconOnly variant='light' color='default' onPress={dismissAlert}>
              <IconClose className='h-5 w-5' />
            </Button>
          </div>
        }
      />

      <BatchMigrationModal
        isOpen={isMigrationModalOpen}
        onClose={() => setIsMigrationModalOpen(false)}
        sourceChain={chain}
        destChain={migrationCompleted.destChain}
        batchList={txs}
        address={address}
        block={migrationCompleted.block}
        onMigrate={handleMigrationComplete}
      />
    </>
  );
}

export default BatchMigrationAlert;
