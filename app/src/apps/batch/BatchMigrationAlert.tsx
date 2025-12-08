// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { BatchTxItem } from '@/hooks/types';

import { type Network, useChains } from '@mimir-wallet/polkadot-core';
import { Alert, AlertTitle, Button } from '@mimir-wallet/ui';
import { useState } from 'react';

import { BatchMigrationModal } from './BatchMigrationModal';

import IconClose from '@/assets/svg/icon-close.svg?react';
import { toastSuccess } from '@/components/utils';
import {
  useBatchMigrationStatus,
  useNetworkMigrationCompleted,
} from '@/features/assethub-migration/useMigrationStatus';

function BatchMigrationAlert({
  chain,
  txs,
  address,
  onMigrationComplete,
}: {
  chain: string;
  txs: BatchTxItem[];
  address: string;
  onMigrationComplete?: () => void;
}) {
  const { isAlertVisible, dismissAlert } = useBatchMigrationStatus(
    chain,
    address,
  );

  const [isMigrationModalOpen, setIsMigrationModalOpen] = useState(false);
  const { chains } = useChains();
  const migrationCompleted = useNetworkMigrationCompleted(chain);

  if (
    !isAlertVisible ||
    !migrationCompleted.completed ||
    !migrationCompleted.block ||
    !migrationCompleted.destChain
  ) {
    return null;
  }

  const destNetwork = chains.find(
    (network: Network) => network.key === migrationCompleted.destChain,
  );

  const handleMigrationComplete = () => {
    dismissAlert();
    toastSuccess('Batch migration completed');
    onMigrationComplete?.();
  };

  return (
    <>
      <Alert className="grow-0" variant="warning">
        <AlertTitle className="relative flex items-center">
          <span className="font-normal">
            Due to the Assethub Migration, you can copy Batch to{' '}
            <img
              draggable={false}
              style={{
                display: 'inline',
                width: '1em',
                height: '1em',
                userSelect: 'none',
              }}
              src={destNetwork?.icon}
            />{' '}
            {destNetwork?.name}.{' '}
            <button
              className="text-primary underline"
              onClick={() => setIsMigrationModalOpen(true)}
            >
              View The List{'>>'}
            </button>
          </span>

          <Button
            size="sm"
            className="absolute right-0"
            isIconOnly
            variant="light"
            onClick={dismissAlert}
          >
            <IconClose className="h-5 w-5" />
          </Button>
        </AlertTitle>
      </Alert>

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
