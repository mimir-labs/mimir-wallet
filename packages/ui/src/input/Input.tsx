// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Input } from '@heroui/input';
import { extendVariants } from '@heroui/system';

const CustomInput = extendVariants(Input, {
  variants: {},
  defaultVariants: {
    size: 'md',
    color: 'primary',
    variant: 'bordered',
    labelPlacement: 'outside'
  },
  compoundVariants: []
}) as typeof Input;

export default CustomInput as typeof Input;
