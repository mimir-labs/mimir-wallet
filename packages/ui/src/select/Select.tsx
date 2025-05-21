// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Select } from '@heroui/select';
import { extendVariants } from '@heroui/system';

const CustomSelect = extendVariants(Select, {
  defaultVariants: {
    endContent: '123'
  }
}) as typeof Select;

export default CustomSelect as typeof Select;
