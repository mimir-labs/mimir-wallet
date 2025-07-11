// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Select, SelectItem } from '@heroui/select';
import { extendVariants } from '@heroui/system';

const CustomSelect = extendVariants(Select, {
  variants: {
    radius: {
      sm: {
        label: 'w-full text-inherit',
        innerWrapper: 'rounded-small'
      },
      md: {
        label: 'w-full text-inherit',
        innerWrapper: 'rounded-medium'
      },
      lg: {
        label: 'w-full text-inherit',
        innerWrapper: 'rounded-large'
      }
    },
    color: {
      default: {
        innerWrapper: 'border-divider-300 data-[hover=true]:bg-foreground-50 data-[hover=true]:border-foreground'
      },
      primary: {
        innerWrapper: 'border-divider-300 data-[hover=true]:bg-primary-50 data-[hover=true]:border-primary'
      },
      success: {
        innerWrapper: 'border-divider-300 data-[hover=true]:bg-success-50 data-[hover=true]:border-success'
      },
      danger: {
        innerWrapper: 'border-divider-300 data-[hover=true]:bg-danger-50 data-[hover=true]:border-danger'
      },
      warning: {
        innerWrapper: 'border-divider-300 data-[hover=true]:bg-warning-50 data-[hover=true]:border-warning'
      },
      secondary: {
        innerWrapper: 'border-divider-300 data-[hover=true]:bg-secondary-50 data-[hover=true]:border-secondary'
      }
    },
    variant: {
      bordered: {
        selectorIcon: 'w-5 h-5 -mr-2'
      }
    }
  },
  defaultVariants: {
    selectorIcon: (
      <svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 20 20' fill='none'>
        <path
          d='M10.7998 13.9344C10.3998 14.4674 9.60022 14.4674 9.20021 13.9344L5.57194 9.10028C5.07718 8.44109 5.54751 7.5 6.37172 7.5L13.6283 7.5C14.4525 7.5 14.9228 8.44109 14.4281 9.10028L10.7998 13.9344Z'
          fill='currentColor'
        />
      </svg>
    ) as any
  }
}) as typeof Select;

export { CustomSelect as Select, SelectItem };
