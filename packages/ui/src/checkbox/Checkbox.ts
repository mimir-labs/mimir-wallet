// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Checkbox } from '@heroui/checkbox';
import { extendVariants } from '@heroui/system';

const CustomCheckbox = extendVariants(Checkbox, {
  variants: {
    size: {
      sm: { base: 'p-1' },
      md: { base: 'p-2' },
      lg: { base: 'p-3' }
    }
  },
  defaultVariants: {
    size: 'md'
  },
  compoundVariants: []
}) as typeof Checkbox;

export default CustomCheckbox as typeof Checkbox;
