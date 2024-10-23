// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid2 as Grid } from '@mui/material';
import React from 'react';

interface Props {
  name?: React.ReactNode;
  content?: React.ReactNode;
}

function Item({ content, name }: Props) {
  return (
    <Grid container spacing={1} columns={10} sx={{ width: '100%', fontSize: '0.75rem' }}>
      <Grid sx={{ display: 'flex', alignItems: 'center', fontWeight: 700 }} size={2}>
        {name}
      </Grid>
      <Grid sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }} size={8}>
        {content}
      </Grid>
    </Grid>
  );
}

export default React.memo(Item);
