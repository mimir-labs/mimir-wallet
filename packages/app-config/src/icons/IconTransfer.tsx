// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

// generate by buildAssets.js

import type { SvgIconProps } from '@mui/material';

import { SvgIcon } from '@mui/material';
import React from 'react';

import IconTransferSvg from '../assets/icon-transfer.svg';

function IconTransfer(props: SvgIconProps) {
  return <SvgIcon component={IconTransferSvg} fontSize='inherit' viewBox='0 0 18 18' {...props} />;
}

export default React.memo(IconTransfer);
