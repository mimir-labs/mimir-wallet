// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { extendVariants } from '@heroui/system';
import { Tooltip } from '@heroui/tooltip';

const CustomTooltip = extendVariants(Tooltip, {
  variants: {
    size: {
      sm: {
        content: 'max-w-full'
      },
      md: {
        content: 'max-w-full'
      },
      lg: {
        content: 'max-w-full'
      }
    }
  },
  defaultVariants: {
    size: 'md',
    closeDelay: 0
  },
  compoundVariants: []
}) as typeof Tooltip;

export default CustomTooltip as typeof Tooltip;
