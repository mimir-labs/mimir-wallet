// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

// generate by buildAssets.js

import type { SvgIconProps } from '@mui/material';

import { SvgIcon } from '@mui/material';
import React from 'react';

import IconTransactionSvg from '../assets/icon-transaction.svg';

function IconTransaction(props: SvgIconProps) {
  return <SvgIcon component={IconTransactionSvg} fontSize='inherit' viewBox='0 0 21 21' {...props} />;
}

export default React.memo(IconTransaction);
