// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { DappCell } from '@/components';
import { useDapps } from '@/hooks/useDapp';
import { useMedia } from 'react-use';

function AppList() {
  const { addFavorite, dapps, isFavorite, removeFavorite } = useDapps();
  const isMobile = useMedia('(max-width: 768px)');

  return (
    <div className={isMobile ? 'flex flex-col gap-4' : 'grid grid-cols-[repeat(auto-fill,_minmax(258px,1fr))] gap-6'}>
      {dapps.map((dapp) => {
        return (
          <DappCell
            key={dapp.id}
            addFavorite={addFavorite}
            isFavorite={isFavorite}
            removeFavorite={removeFavorite}
            variant={isMobile ? 'mobile' : 'default'}
            {...dapp}
          />
        );
      })}
    </div>
  );
}

export default AppList;
