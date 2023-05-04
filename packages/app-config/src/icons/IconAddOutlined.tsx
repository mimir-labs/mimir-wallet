// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

// generate by buildAssets.js

import type { SvgIconProps } from '@mui/material';

import { SvgIcon } from '@mui/material';
import React from 'react';

import IconAddOutlinedSvg from '../assets/icon-add-outlined.svg';

function IconAddOutlined(props: SvgIconProps) {
  return <SvgIcon component={IconAddOutlinedSvg} fontSize='inherit' viewBox='0 0 30 30' {...props} />;
}

export default React.memo(IconAddOutlined);
