// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Spinner as HeroSpinner } from '@heroui/spinner';
import { extendVariants } from '@heroui/system';

const Spinner = extendVariants(HeroSpinner, {
  variants: {},
  defaultVariants: {
    variant: 'default',
    color: 'primary'
  },
  compoundVariants: []
}) as typeof HeroSpinner;

export default Spinner;
