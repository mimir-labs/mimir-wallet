// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { CSSObject } from '@mui/material';

export const ellipsisMixin = (width?: number | string): CSSObject => ({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  width
});
