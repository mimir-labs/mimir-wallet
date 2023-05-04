// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

// generate by buildAssets.js

import type { SvgIconProps } from '@mui/material';

import { SvgIcon } from '@mui/material';
import React from 'react';

import LogoKusamaSvg from '../assets/logo-kusama.svg';

function LogoKusama(props: SvgIconProps) {
  return <SvgIcon component={LogoKusamaSvg} fontSize='inherit' viewBox='0 0 524.17 121.01' {...props} />;
}

export default React.memo(LogoKusama);
