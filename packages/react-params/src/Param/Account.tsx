// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Typography } from '@mui/material';
import React from 'react';

import { AddressMini } from '@mimirdev/react-components';

import Item from './Item';
import { ParamProps } from './types';

function Account({ param, type, value }: ParamProps) {
  return <Item content={<AddressMini value={value.value.toString()} withCopy />} name={<Typography fontWeight={700}>{param.name}</Typography>} type={type} />;
}

export default React.memo(Account);
