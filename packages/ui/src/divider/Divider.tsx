// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Divider } from '@heroui/divider';
import { extendVariants } from '@heroui/system';

const CustomDivider = extendVariants(Divider, {
  variants: {
    orientation: {
      horizontal: 'w-full h-divider bg-secondary',
      vertical: 'h-full w-divider bg-secondary'
    }
  },
  defaultVariants: {
    orientation: 'horizontal'
  }
});

export default CustomDivider;
