// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

// generate by buildAssets.js

import type { SvgIconProps } from '@mui/material';

import { SvgIcon } from '@mui/material';
import React from 'react';

import IconProfileSvg from '../assets/icon-profile.svg';

function IconProfile(props: SvgIconProps) {
  return <SvgIcon component={IconProfileSvg} fontSize='inherit' viewBox='0 0 20 20' {...props} />;
}

export default React.memo(IconProfile);
