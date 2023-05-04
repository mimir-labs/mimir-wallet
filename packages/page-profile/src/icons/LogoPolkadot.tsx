// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

// generate by buildAssets.js

import type { SvgIconProps } from '@mui/material';

import { SvgIcon } from '@mui/material';
import React from 'react';

import LogoPolkadotSvg from '../assets/logo-polkadot.svg';

function LogoPolkadot(props: SvgIconProps) {
  return <SvgIcon component={LogoPolkadotSvg} fontSize='inherit' viewBox='0 0 6593.8 1410.3' {...props} />;
}

export default React.memo(LogoPolkadot);
