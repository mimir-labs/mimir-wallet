// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Modal } from '@heroui/modal';
import { extendVariants } from '@heroui/system';

const CustomModal = extendVariants(Modal, {
  variants: {
    size: {
      xs: { header: 'py-4 px-4 sm:px-5', footer: 'py-4 px-4 sm:px-5', body: 'py-4 px-4 sm:px-5' },
      sm: { header: 'py-4 px-4 sm:px-5', footer: 'py-4 px-4 sm:px-5', body: 'py-4 px-4 sm:px-5' },
      md: { header: 'py-4 px-4 sm:px-5', footer: 'py-4 px-4 sm:px-5', body: 'py-4 px-4 sm:px-5' },
      lg: { header: 'py-4 px-4 sm:px-5', footer: 'py-4 px-4 sm:px-5', body: 'py-4 px-4 sm:px-5' },
      xl: { header: 'py-4 px-4 sm:px-5', footer: 'py-4 px-4 sm:px-5', body: 'py-4 px-4 sm:px-5' },
      '2xl': { header: 'py-4 px-4 sm:px-5', footer: 'py-4 px-4 sm:px-5', body: 'py-4 px-4 sm:px-5' },
      '3xl': { header: 'py-4 px-4 sm:px-5', footer: 'py-4 px-4 sm:px-5', body: 'py-4 px-4 sm:px-5' },
      '4xl': { header: 'py-4 px-4 sm:px-5', footer: 'py-4 px-4 sm:px-5', body: 'py-4 px-4 sm:px-5' },
      full: { header: 'py-4 px-4 sm:px-5', footer: 'py-4 px-4 sm:px-5', body: 'py-4 px-4 sm:px-5' }
    }
  },
  defaultVariants: {
    size: 'lg'
  },
  compoundVariants: []
}) as typeof Modal;

export default CustomModal as typeof Modal;
