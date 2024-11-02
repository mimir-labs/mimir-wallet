// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { DappOption } from '@mimir-wallet/config';

import { Grid2 as Grid } from '@mui/material';

import { DappCell } from '@mimir-wallet/components';

function FavoriteDapps({
  addFavorite,
  dapps,
  isFavorite,
  removeFavorite
}: {
  dapps: DappOption[];
  isFavorite: (id: number) => boolean;
  addFavorite: (id: number) => void;
  removeFavorite: (id: number) => void;
}) {
  return (
    <Grid columns={{ xs: 12 }} container spacing={2.5}>
      {dapps.map((dapp, index) => {
        return (
          <Grid key={index} size={{ lg: 4, sm: 6, xs: 12 }}>
            <DappCell addFavorite={addFavorite} dapp={dapp} isFavorite={isFavorite} removeFavorite={removeFavorite} />
          </Grid>
        );
      })}
    </Grid>
  );
}

export default FavoriteDapps;
