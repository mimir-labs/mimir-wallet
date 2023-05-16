// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import Grid from '@mui/material/Unstable_Grid2';

import { dapps } from '@mimirdev/app-config';

import DappCell from './DappCell';

function PageDapp() {
  return (
    <Grid columns={{ xs: 12 }} container spacing={2.5}>
      {dapps.map((dapp, index) => {
        return (
          <Grid key={index} lg={4} md={6} xs={12}>
            <DappCell dapp={dapp} />
          </Grid>
        );
      })}
    </Grid>
  );
}

export default PageDapp;
