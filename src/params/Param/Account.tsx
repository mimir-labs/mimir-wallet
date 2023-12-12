// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Typography } from '@mui/material';
import React from 'react';

import { AddressRow } from '@mimirdev/components';

import Item from './Item';
import { ParamProps } from './types';

function Account({ param, type, value }: ParamProps) {
  return (
    <Item
      content={<AddressRow defaultName={value.value.toString()} shorten={false} size='small' value={value.value.toString()} withAddress={false} withCopy withName />}
      name={<Typography fontWeight={700}>{param.name}</Typography>}
      type={type}
    />
  );
}

export default React.memo(Account);
