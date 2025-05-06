// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Alert as HeroAlert } from '@heroui/alert';
import { extendVariants } from '@heroui/system';

const Alert = extendVariants(HeroAlert, {
  variants: {
    hideIconWrapper: {
      true: {
        iconWrapper: 'w-6 h-6'
      },
      false: {
        iconWrapper: 'w-6 h-6'
      }
    },
    size: {
      md: {
        base: 'rounded-medium',
        title: 'min-h-6 flex items-center font-bold',
        mainWrapper: 'min-h-6',
        description: 'mt-1.5 text-tiny'
      }
    },
    color: {
      warning: {
        base: 'bg-warning-50 text-foreground',
        alertIcon: 'text-warning'
      },
      success: {
        base: 'bg-success-50 text-foreground',
        alertIcon: 'text-success'
      },
      danger: {
        base: 'bg-danger-50 text-foreground',
        alertIcon: 'text-danger'
      },
      primary: {
        base: 'bg-primary-50 text-foreground',
        alertIcon: 'text-primary'
      }
    },
    variant: {
      solid: {
        base: ''
      }
    }
  },
  defaultVariants: {
    hideIconWrapper: true,
    size: 'md',
    variant: 'solid',
    color: 'warning'
  }
});

export default Alert;
