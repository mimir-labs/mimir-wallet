// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import Grid from '@mui/material/Unstable_Grid2';

import { DappCell } from '@mimir-wallet/components';
import { useDapps } from '@mimir-wallet/hooks';

function PageDapp() {
  const { addFavorite, dapps, isFavorite, removeFavorite } = useDapps();

  return (
    <Grid columns={{ xs: 12 }} container spacing={2.5}>
      {dapps.map((dapp, index) => {
        return (
          <Grid key={index} lg={4} md={6} xs={12}>
            <DappCell addFavorite={addFavorite} dapp={dapp} isFavorite={isFavorite} removeFavorite={removeFavorite} />
          </Grid>
        );
      })}
    </Grid>
  );
}

export default PageDapp;
