// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Button } from '@heroui/button';
import { extendVariants } from '@heroui/system';

const CustomButton = extendVariants(Button, {
  variants: {
    size: {
      sm: 'h-6 min-w-6 px-2',
      md: 'h-8 min-w-8 px-3',
      lg: 'h-10 min-w-10 px-4'
    },
    isIconOnly: {
      true: 'min-w-0 px-0'
    },
    isDisabled: {
      true: 'pointer-events-auto bg-divider-300 text-white border-none'
    }
  },
  defaultVariants: {
    size: 'md',
    radius: 'full',
    color: 'primary'
  },
  compoundVariants: [
    {
      size: 'sm',
      isIconOnly: true,
      class: 'w-6'
    },
    {
      size: 'md',
      isIconOnly: true,
      class: 'w-8'
    },
    {
      size: 'lg',
      isIconOnly: true,
      class: 'w-10'
    }
  ]
}) as typeof Button;

export default CustomButton as typeof Button;
