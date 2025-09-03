// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import IconClose from '@/assets/svg/icon-close.svg?react';
import IconInfo from '@/assets/svg/icon-info-fill.svg?react';
import { MIGRATION_NOTICE_DOCS_URL } from '@/constants';
import { useEffect, useState } from 'react';

import { useNetworks } from '@mimir-wallet/polkadot-core';
import { Button } from '@mimir-wallet/ui';

import MigrationModal from './MigrationModal';
import { useMigrationNetworks, useMigrationStatus } from './useMigrationStatus';

function Item({
  isCompleted,
  sourceChain,
  destChain
}: {
  isCompleted: boolean;
  sourceChain: string;
  destChain: string;
}) {
  const { isAlertVisible, dismissAlert } = useMigrationStatus(sourceChain, isCompleted);
  const { networks } = useNetworks();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const sourceNetwork = networks.find((network) => network.key === sourceChain);
  const destNetwork = networks.find((network) => network.key === destChain);

  const handleMigratedAccountsClick = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  if (!isAlertVisible) {
    return null;
  }

  return (
    <>
      <div data-completed={isCompleted} className='bg-home-main w-full rounded-[5px]'>
        <div className='relative flex w-full flex-row items-center'>
          <div className='relative flex h-[38px] w-full flex-row items-center justify-start gap-2.5 pl-5 text-white'>
            <div className='relative h-4 w-4 shrink-0'>
              <IconInfo className='h-4 w-4 text-white' />
            </div>

            {isCompleted ? (
              <p className='text-small flex-1 text-left leading-normal font-bold text-white'>
                <span>
                  {destNetwork?.name} Migration on {sourceNetwork?.name} has been completed — check out{' '}
                </span>
                <a target='_blank' href={MIGRATION_NOTICE_DOCS_URL} className='text-white underline'>
                  what&apos;s changed
                </a>
                <span> and </span>
                <button className='text-white underline' onClick={handleMigratedAccountsClick}>
                  migrated accounts
                </button>
              </p>
            ) : (
              <p className='text-small flex-1 text-left leading-normal font-bold text-white'>
                The Assethub Migration starts on {sourceNetwork?.name} on July 7. After the migration, all
                multisig/proxy on {sourceNetwork?.name} will be moved to {destNetwork?.name}.
                <a target='_blank' href={MIGRATION_NOTICE_DOCS_URL} className='text-white underline'>
                  View Details
                </a>
              </p>
            )}

            <Button isIconOnly className='text-inherit' size='sm' variant='light' onClick={dismissAlert}>
              <IconClose className='h-4 w-4' />
            </Button>
          </div>
        </div>
      </div>

      <MigrationModal isOpen={isModalOpen} onClose={handleModalClose} sourceChain={sourceChain} destChain={destChain} />
    </>
  );
}

function MigrationAlert({ onMigrationCounts }: { onMigrationCounts: (counts: number) => void }) {
  const { data: migrationNetworks } = useMigrationNetworks();

  useEffect(() => {
    onMigrationCounts(migrationNetworks?.length ?? 0);
  }, [migrationNetworks, onMigrationCounts]);

  return migrationNetworks
    ?.slice(0, 1)
    ?.map((network) => (
      <Item
        key={network.chain}
        isCompleted={network.status === 'completed'}
        sourceChain={network.chain}
        destChain={network.destChain}
      />
    ));
}

export default MigrationAlert;
