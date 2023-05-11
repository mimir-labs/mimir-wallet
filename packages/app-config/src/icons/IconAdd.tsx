// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

// generate by buildAssets.js

import type { SvgIconProps } from '@mui/material';

import { SvgIcon } from '@mui/material';
import React from 'react';

import IconAddSvg from '../assets/icon-add.svg';

function IconAdd(props: SvgIconProps) {
  return <SvgIcon component={IconAddSvg} fontSize='inherit' viewBox='0 0 12 12' {...props} />;
}

export default React.memo(IconAdd);
