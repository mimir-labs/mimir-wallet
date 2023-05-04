// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

// generate by buildAssets.js

import type { SvgIconProps } from '@mui/material';

import { SvgIcon } from '@mui/material';
import React from 'react';

import ArrowRightSvg from '../assets/ArrowRight.svg';

function ArrowRight(props: SvgIconProps) {
  return <SvgIcon component={ArrowRightSvg} fontSize='inherit' viewBox='0 0 8 10' {...props} />;
}

export default React.memo(ArrowRight);
