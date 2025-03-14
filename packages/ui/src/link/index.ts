// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Link } from '@heroui/link';
import { extendVariants } from '@heroui/system';

const CustomLink = extendVariants(Link, {
  variants: {
    size: {
      sm: 'text-[length:inherit]',
      md: 'text-[length:inherit]',
      lg: 'text-[length:inherit]'
    }
  },
  defaultVariants: {
    size: 'md'
  },
  compoundVariants: []
}) as typeof Link;

export default CustomLink as typeof Link;
