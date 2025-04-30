// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { DappCell } from '@/components';
import { useDapps } from '@/hooks/useDapp';

function PageDapp() {
  const { addFavorite, dapps, isFavorite, removeFavorite } = useDapps();

  return (
    <div className='grid grid-cols-12 gap-6'>
      {dapps.map((dapp, index) => {
        return (
          <div className='col-span-12 md:col-span-6 lg:col-span-4' key={index}>
            <DappCell addFavorite={addFavorite} dapp={dapp} isFavorite={isFavorite} removeFavorite={removeFavorite} />
          </div>
        );
      })}
    </div>
  );
}

export default PageDapp;
