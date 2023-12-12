// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ParamType } from '../types';

import { Box, Stack } from '@mui/material';
import React from 'react';

interface Props {
  name?: React.ReactNode;
  content?: React.ReactNode;
  type: ParamType;
  alignItem?: 'start' | 'center' | 'end';
}

function Item({ alignItem = 'center', content, name, type }: Props) {
  if (type === 'base') {
    return (
      <Stack spacing={0.5}>
        <Box fontWeight={700}>{name}</Box>
        <Box>{content}</Box>
      </Stack>
    );
  }

  return (
    <Stack alignItems={alignItem} direction='row'>
      <Box sx={{ width: '30%', maxWidth: 130, fontWeight: 700, textTransform: 'capitalize' }}>{name}</Box>
      <Box sx={{ width: '70%', flex: '1 0 auto' }}>{content}</Box>
    </Stack>
  );
}

export default React.memo(Item);
