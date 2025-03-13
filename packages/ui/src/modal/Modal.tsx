// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Modal } from '@heroui/modal';
import { extendVariants } from '@heroui/system';

const CustomModal = extendVariants(Modal, {
  variants: {
    size: {
      xs: { body: 'py-4 px-4 sm:px-5' },
      sm: { body: 'py-4 px-4 sm:px-5' },
      md: { body: 'py-4 px-4 sm:px-5' },
      lg: { body: 'py-4 px-4 sm:px-5' },
      xl: { body: 'py-4 px-4 sm:px-5' },
      '2xl': { body: 'py-4 px-4 sm:px-5' },
      '3xl': { body: 'py-4 px-4 sm:px-5' },
      '4xl': { body: 'py-4 px-4 sm:px-5' },
      full: { body: 'py-4 px-4 sm:px-5' }
    }
  },
  defaultVariants: {
    size: 'lg'
  },
  compoundVariants: []
}) as typeof Modal;

export default CustomModal as typeof Modal;
