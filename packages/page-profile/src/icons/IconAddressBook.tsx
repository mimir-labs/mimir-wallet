// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

// generate by buildAssets.js

import type { SvgIconProps } from '@mui/material';

import { SvgIcon } from '@mui/material';
import React from 'react';

import IconAddressBookSvg from '../assets/icon-address-book.svg';

function IconAddressBook(props: SvgIconProps) {
  return <SvgIcon component={IconAddressBookSvg} fontSize='inherit' viewBox='0 0 16 20' {...props} />;
}

export default React.memo(IconAddressBook);
