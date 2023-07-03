// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

// generate by buildAssets.js

import type { SvgIconProps } from '@mui/material';

import { SvgIcon } from '@mui/material';
import React from 'react';

import IconAddFillSvg from '../assets/icon-add-fill.svg';

function IconAddFill(props: SvgIconProps) {
  return <SvgIcon component={IconAddFillSvg} fontSize='inherit' viewBox='0 0 16 17' {...props} />;
}

export default React.memo(IconAddFill);
