// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { extendVariants } from '@heroui/system';
import { Tabs as HeroTabs } from '@heroui/tabs';

const Tabs = extendVariants(HeroTabs, {
  variants: {
    size: {
      md: {
        tabList: 'rounded-[20px] p-2.5',
        tabContent: 'font-bold',
        cursor: ['rounded-[10px]'],
        panel: ['p-0', 'pt-0']
      }
    },
    variant: {
      solid: {
        tabList: 'bg-content1 shadow-medium'
      },
      underlined: {
        tabList: 'bg-transparent shadow-none'
      }
    },
    color: {
      primary: {
        tabContent: 'text-primary/50'
      }
    }
  },
  defaultVariants: {
    size: 'md',
    variant: 'solid'
  },
  compoundVariants: [
    {
      variant: 'underlined',
      color: 'primary',
      class: {
        tabContent: 'text-foreground/30'
      } as any
    }
  ]
}) as typeof HeroTabs;

export default Tabs;
