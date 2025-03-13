// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Chip } from '@heroui/chip';
import { extendVariants } from '@heroui/system';

const CustomChip = extendVariants(Chip, {
  variants: {
    size: {
      sm: { base: 'h-[18px]' },
      md: { base: 'h-[22px]' },
      lg: { base: 'h-[26px]' }
    }
  },
  defaultVariants: {
    size: 'md'
  },
  compoundVariants: []
}) as typeof Chip;

export default CustomChip as typeof Chip;
