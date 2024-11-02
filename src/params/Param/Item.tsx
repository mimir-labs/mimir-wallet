// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Grid2 as Grid, Stack, Typography } from '@mui/material';
import React from 'react';

interface Props {
  type?: 'horizontal' | 'vertical';
  name?: React.ReactNode;
  content?: React.ReactNode;
}

function Item({ content, name, type = 'horizontal' }: Props) {
  if (type === 'vertical') {
    return (
      <Stack spacing={0.5}>
        <Typography fontWeight={700}>{name}</Typography>

        <Box sx={{ padding: 1, bgcolor: 'secondary.main', borderRadius: 1 }}>{content}</Box>
      </Stack>
    );
  }

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
