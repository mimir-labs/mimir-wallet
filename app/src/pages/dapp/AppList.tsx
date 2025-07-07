// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { DappCell } from '@/components';
import { useDapps } from '@/hooks/useDapp';

function AppList() {
  const { addFavorite, dapps, isFavorite, removeFavorite } = useDapps();

  return (
    <div className='grid grid-cols-[repeat(auto-fit,_minmax(258px,320px))] gap-6'>
      {dapps.map((dapp) => {
        return (
          <DappCell
            key={dapp.id}
            addFavorite={addFavorite}
            isFavorite={isFavorite}
            removeFavorite={removeFavorite}
            {...dapp}
          />
        );
      })}
    </div>
  );
}

export default AppList;
