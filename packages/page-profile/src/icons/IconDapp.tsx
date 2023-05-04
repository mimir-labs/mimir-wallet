// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

// generate by buildAssets.js

import type { SvgIconProps } from '@mui/material';

import { SvgIcon } from '@mui/material';
import React from 'react';

import IconDappSvg from '../assets/icon-dapp.svg';

function IconDapp(props: SvgIconProps) {
  return <SvgIcon component={IconDappSvg} fontSize='inherit' viewBox='0 0 20 20' {...props} />;
}

export default React.memo(IconDapp);
