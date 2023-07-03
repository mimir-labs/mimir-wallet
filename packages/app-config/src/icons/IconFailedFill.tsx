// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

// generate by buildAssets.js

import type { SvgIconProps } from '@mui/material';

import { SvgIcon } from '@mui/material';
import React from 'react';

import IconFailedFillSvg from '../assets/icon-failed-fill.svg';

function IconFailedFill(props: SvgIconProps) {
  return <SvgIcon component={IconFailedFillSvg} fontSize='inherit' viewBox='0 0 16 17' {...props} />;
}

export default React.memo(IconFailedFill);
