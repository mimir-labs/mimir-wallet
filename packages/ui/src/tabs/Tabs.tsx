// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { extendVariants } from '@heroui/system';
import { Tabs } from '@heroui/tabs';

const CustomTabs = extendVariants(Tabs, {
  variants: {
    size: {
      md: {
        tabList: 'shadow-medium rounded-large p-2.5',
        tabContent: 'font-bold',
        cursor: ['rounded-medium'],
        panel: ['p-0', 'pt-0']
      }
    },
    color: {
      primary: {
        tabList: 'bg-white',
        tabContent: 'text-primary/50'
      }
    }
  },
  defaultVariants: {
    size: 'md'
  }
}) as typeof Tabs;

export default CustomTabs as typeof Tabs;
