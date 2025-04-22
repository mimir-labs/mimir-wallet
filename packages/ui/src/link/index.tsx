// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { extendVariants } from '@heroui/system';

import LinkBase from './Link.js';

const Link = extendVariants(LinkBase, {
  variants: {
    size: {
      sm: 'text-[0.875em]',
      md: 'text-[1em]',
      lg: 'text-[1.125em]'
    }
  },
  defaultVariants: {
    size: 'md',
    color: 'primary'
  }
}) as typeof LinkBase;

export default Link;
