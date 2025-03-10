// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Drawer } from '@heroui/drawer';
import { extendVariants } from '@heroui/system';

const CustomDrawer = extendVariants(Drawer, {
  variants: {
    size: {
      xs: {
        header: ['px-4 sm:px-5'],
        body: ['px-4 sm:px-5'],
        footer: ['px-4 sm:px-5']
      },
      sm: {
        header: ['px-4 sm:px-5'],
        body: ['px-4 sm:px-5'],
        footer: ['px-4 sm:px-5']
      },
      md: {
        header: ['px-4 sm:px-5'],
        body: ['px-4 sm:px-5'],
        footer: ['px-4 sm:px-5']
      },
      lg: {
        header: ['px-4 sm:px-5'],
        body: ['px-4 sm:px-5'],
        footer: ['px-4 sm:px-5']
      },
      xl: {
        header: ['px-4 sm:px-5'],
        body: ['px-4 sm:px-5'],
        footer: ['px-4 sm:px-5']
      },
      '2xl': {
        header: ['px-4 sm:px-5'],
        body: ['px-4 sm:px-5']
      }
    }
  },
  defaultVariants: {
    size: 'xl'
  },
  compoundVariants: []
}) as typeof Drawer;

export default CustomDrawer as typeof Drawer;
