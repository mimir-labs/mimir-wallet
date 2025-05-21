// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { DappCell } from '@/components';
import { useDapps } from '@/hooks/useDapp';

import WalletConnectExample from './WalletConnectExample';

function PageDapp() {
  const { addFavorite, dapps, isFavorite, removeFavorite } = useDapps();

  return (
    <div className='flex flex-col gap-5'>
      <WalletConnectExample />

      <div className='grid grid-cols-[repeat(auto-fit,_minmax(258px,_1fr))] gap-6'>
        {dapps.map((dapp) => {
          return (
            <DappCell
              key={dapp.id}
              addFavorite={addFavorite}
              dapp={dapp}
              isFavorite={isFavorite}
              removeFavorite={removeFavorite}
            />
          );
        })}
      </div>
    </div>
  );
}

export default PageDapp;
