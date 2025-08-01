// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { DappCell, Empty } from '@/components';
import { useDapps } from '@/hooks/useDapp';
import React, { useMemo } from 'react';

function FavoriteDapps() {
  const { addFavorite, dapps, isFavorite, removeFavorite } = useDapps();

  const favoriteDapps = useMemo(() => {
    return dapps.filter((dapp) => isFavorite(dapp.id));
  }, [dapps, isFavorite]);

  if (favoriteDapps.length === 0) {
    return (
      <div className='rounded-large shadow-medium bg-content1 w-full'>
        <Empty variant='favorite-dapps' height='200px' />
      </div>
    );
  }

  return (
    <div className='grid grid-cols-2 gap-[15px] sm:grid-cols-[repeat(auto-fill,_minmax(183px,1fr))]'>
      {favoriteDapps.map((dapp) => (
        <DappCell
          size='sm'
          key={dapp.id}
          addFavorite={addFavorite}
          isFavorite={isFavorite}
          removeFavorite={removeFavorite}
          {...dapp}
        />
      ))}
    </div>
  );
}

export default React.memo(FavoriteDapps);
