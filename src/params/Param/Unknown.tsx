// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Stack, Typography } from '@mui/material';
import React from 'react';

import { ParamProps } from './types';

function Unknown({ param, value }: ParamProps) {
  return (
    <Stack spacing={0.5}>
      <Typography fontWeight={700}>Unknown type: {param.name}</Typography>
      <Typography>Value: {value.value.toString()}</Typography>
    </Stack>
  );
}

export default React.memo(Unknown);
