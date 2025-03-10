// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Modal } from '@heroui/modal';
import { extendVariants } from '@heroui/system';

const CustomModal = extendVariants(Modal, {
  variants: {
    size: {
      xs: { body: 'py-4' },
      sm: { body: 'py-4' },
      md: { body: 'py-4' },
      lg: { body: 'py-4' },
      xl: { body: 'py-4' },
      '2xl': { body: 'py-4' },
      '3xl': { body: 'py-4' },
      '4xl': { body: 'py-4' },
      full: { body: 'py-4' }
    }
  },
  defaultVariants: {
    size: 'lg'
  },
  compoundVariants: []
}) as typeof Modal;

export default CustomModal as typeof Modal;
