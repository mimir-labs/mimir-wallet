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
      <div className='grid grid-cols-[repeat(auto-fill,_minmax(258px,1fr))] gap-6'>
        <div
          key='add-custom-app'
          className='relative cursor-pointer p-5 rounded-large bg-content1 border-1 border-secondary shadow-medium aspect-square flex flex-col justify-center items-center gap-5'
          onClick={toggleOpen}
        >
          <Button className='w-16 h-16' variant='light' isIconOnly size='lg' radius='full' onPress={toggleOpen}>
            <IconAdd className='text-primary w-16 h-16' />
          </Button>
          <h3 className='text-2xl font-bold text-center'>Add New Customized App</h3>
          <p className='text-tiny text-foreground/50 text-center'>You can add apps not listed but support Mimir SDK.</p>
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
