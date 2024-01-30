// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { findSupportedDapps } from '@mimir-wallet/config';
import { useApi } from '@mimir-wallet/hooks';
import Grid from '@mui/material/Unstable_Grid2';
import { useMemo } from 'react';

import DappCell from './DappCell';

function PageDapp() {
  const { api } = useApi();
  const dapps = useMemo(() => findSupportedDapps(api), [api]);

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
