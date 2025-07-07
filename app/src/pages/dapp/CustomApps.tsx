// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import IconAdd from '@/assets/svg/icon-add-fill.svg?react';
import { DappCell } from '@/components';
import { useDapps } from '@/hooks/useDapp';
import { useToggle } from 'react-use';

import { Button } from '@mimir-wallet/ui';

import AddCustomApp from './AddCustomApp';

function CustomApps() {
  const [isOpen, toggleOpen] = useToggle(false);
  const { customApps, addFavorite, removeFavorite, isFavorite } = useDapps();

  return (
    <>
      <div className='grid grid-cols-[repeat(auto-fit,_minmax(258px,320px))] gap-6'>
        <div
          key='add-custom-app'
          className='relative cursor-pointer p-5 rounded-large bg-content1 border-1 border-secondary shadow-medium flex flex-row items-center gap-5'
          onClick={toggleOpen}
        >
          <Button variant='light' isIconOnly size='lg' radius='full' onPress={toggleOpen}>
            <IconAdd className='text-primary w-12 h-12' />
          </Button>
          <div>
            <h6 className='font-bold text-medium'>Add New Customized App</h6>
            <p className='mt-1 text-tiny text-foreground text-opacity-50'>
              You can add apps not listed but support Safe SDK.
            </p>
          </div>
        </div>

        {customApps.map((app) => (
          <DappCell
            key={app.id}
            supportedChains={true}
            addFavorite={addFavorite}
            isFavorite={isFavorite}
            removeFavorite={removeFavorite}
            {...app}
            icon={app.icon || ''}
          />
        ))}
      </div>

      <AddCustomApp isOpen={isOpen} onClose={toggleOpen} />
    </>
  );
}

export default CustomApps;
