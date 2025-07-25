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
        mainWrapper: 'min-h-6 ml-1 ms-1',
        description: 'mt-1.5 text-tiny'
      }
    },
    color: {
      warning: {
        base: 'bg-warning/10 text-warning',
        alertIcon: 'text-warning'
      },
      success: {
        base: 'bg-success/10 text-success',
        alertIcon: 'text-success'
      },
      danger: {
        base: 'bg-danger/10 text-danger',
        alertIcon: 'text-danger'
      },
      primary: {
        base: 'bg-primary/10 text-primary',
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
    color: 'warning',
    icon: (
      <svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16' fill='none'>
        <path
          fillRule='evenodd'
          clipRule='evenodd'
          d='M16 8C16 12.4183 12.4183 16 8 16C3.58172 16 0 12.4183 0 8C0 3.58172 3.58172 0 8 0C12.4183 0 16 3.58172 16 8ZM9 4.5C9 5.05228 8.55229 5.5 8 5.5C7.44772 5.5 7 5.05228 7 4.5C7 3.94772 7.44772 3.5 8 3.5C8.55229 3.5 9 3.94772 9 4.5ZM8 6.5C7.44772 6.5 7 6.94772 7 7.5V11.5C7 12.0523 7.44772 12.5 8 12.5C8.55229 12.5 9 12.0523 9 11.5V7.5C9 6.94772 8.55229 6.5 8 6.5Z'
          fill='currentColor'
        />
      </svg>
    ) as any
  }
});

export default Alert;
