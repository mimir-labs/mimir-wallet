// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

// generate by buildAssets.js

import type { SvgIconProps } from '@mui/material';

import { SvgIcon } from '@mui/material';
import React from 'react';

import ArrowUpSvg from '../assets/ArrowUp.svg';

function ArrowUp(props: SvgIconProps) {
  return <SvgIcon component={ArrowUpSvg} fontSize='inherit' viewBox='0 0 11 7' {...props} />;
}

export default React.memo(ArrowUp);
