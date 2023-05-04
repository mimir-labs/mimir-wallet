// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

// generate by buildAssets.js

import type { SvgIconProps } from '@mui/material';

import { SvgIcon } from '@mui/material';
import React from 'react';

import ArrowDownSvg from '../assets/ArrowDown.svg';

function ArrowDown(props: SvgIconProps) {
  return <SvgIcon component={ArrowDownSvg} fontSize='inherit' viewBox='0 0 10 8' {...props} />;
}

export default React.memo(ArrowDown);
