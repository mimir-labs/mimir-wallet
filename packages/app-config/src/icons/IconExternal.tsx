// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

// generate by buildAssets.js

import type { SvgIconProps } from '@mui/material';

import { SvgIcon } from '@mui/material';
import React from 'react';

import IconExternalSvg from '../assets/icon-external.svg';

function IconExternal(props: SvgIconProps) {
  return <SvgIcon component={IconExternalSvg} fontSize='inherit' viewBox='0 0 16 16' {...props} />;
}

export default React.memo(IconExternal);
