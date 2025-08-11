// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import IconClose from '@/assets/svg/icon-close.svg?react';

import { useNetworks } from '@mimir-wallet/polkadot-core';
import { Alert, AlertTitle, Button } from '@mimir-wallet/ui';

import { useNetworkMigrationCompleted } from './useMigrationStatus';

type Props = React.ComponentProps<typeof Alert> & {
  type: 'transfer' | 'create-multisig';
  chain: string;
  onClose?: () => void;
};

function MigrationTip({ type, chain, onClose, ...props }: Props) {
  const { networks } = useNetworks();
  const migrationCompleted = useNetworkMigrationCompleted(chain);

  if (!migrationCompleted.completed) {
    return null;
  }

  const network = networks.find((network) => network.key === chain);
  const destNetwork = networks.find((network) => network.key === migrationCompleted.destChain);

  return (
    <Alert variant='warning' {...props}>
      <AlertTitle className='relative flex w-full items-center justify-between gap-2.5 overflow-y-visible'>
        {type === 'transfer' ? (
          <span>
            Due to the Assethub Migration, your assets on{' '}
            <img
              draggable={false}
              style={{ display: 'inline', width: '1em', height: '1em', verticalAlign: 'middle', userSelect: 'none' }}
              src={network?.icon}
            />{' '}
            {network?.name} have been moved to{' '}
            <img
              draggable={false}
              style={{ display: 'inline', width: '1em', height: '1em', verticalAlign: 'middle', userSelect: 'none' }}
              src={destNetwork?.icon}
            />{' '}
            {destNetwork?.name}.
          </span>
        ) : (
          <span>
            Due to Asset Hub Migration, we strongly recommend you to create pure proxy on{' '}
            <img
              draggable={false}
              style={{ display: 'inline', width: '1em', height: '1em', verticalAlign: 'middle', userSelect: 'none' }}
              src={destNetwork?.icon}
            />{' '}
            {destNetwork?.name}.
          </span>
        )}
        {onClose ? (
          <Button
            isIconOnly
            size='sm'
            variant='light'
            onClick={onClose}
            className='absolute right-0 ml-auto text-inherit'
          >
            <IconClose className='h-5 w-5' />
          </Button>
        ) : null}
      </AlertTitle>
    </Alert>
  );
}

export default MigrationTip;
