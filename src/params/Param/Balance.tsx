// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Typography } from '@mui/material';
import React from 'react';

import { FormatBalance } from '@mimir-wallet/components';

import Item from './Item';
import { ParamProps } from './types';

function Balance({ param, type, value }: ParamProps) {
  return (
    <Item
      content={
        <Typography>
          <FormatBalance value={value.value.toString()} />
        </Typography>
      }
      name={<Typography fontWeight={700}>{param.name}</Typography>}
      type={type}
    />
  );
}

export default React.memo(Balance);
