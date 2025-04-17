// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Paper, Skeleton, Stack } from '@mui/material';

export const skeleton = (
  <Stack spacing={2}>
    {Array.from({ length: 3 }).map((_, index) => (
      <Paper component={Stack} spacing={2} key={index} sx={{ padding: { sm: 2, xs: 1.5 }, borderRadius: 2 }}>
        <Skeleton variant='rectangular' height={118} />
        <Skeleton variant='rectangular' height={20} />
        <Skeleton variant='rectangular' height={20} />
        <Skeleton variant='rectangular' height={20} />
      </Paper>
    ))}
  </Stack>
);
