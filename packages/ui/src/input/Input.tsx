// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Input } from '@heroui/input';
import { extendVariants } from '@heroui/system';

const CustomInput = extendVariants(Input, {
  variants: {
    radius: {
      sm: {
        label: 'w-full text-inherit',
        inputWrapper: 'rounded-small'
      },
      md: {
        label: 'w-full text-inherit',
        inputWrapper: 'rounded-medium'
      },
      lg: {
        label: 'w-full text-inherit',
        inputWrapper: 'rounded-large'
      }
    },
    color: {
      default: {
        inputWrapper: 'border-divider-300 data-[hover=true]:bg-foreground-50 data-[hover=true]:border-foreground'
      },
      primary: {
        inputWrapper: 'border-divider-300 data-[hover=true]:bg-primary-50 data-[hover=true]:border-primary'
      },
      success: {
        inputWrapper: 'border-divider-300 data-[hover=true]:bg-success-50 data-[hover=true]:border-success'
      },
      danger: {
        inputWrapper: 'border-divider-300 data-[hover=true]:bg-danger-50 data-[hover=true]:border-danger'
      },
      warning: {
        inputWrapper: 'border-divider-300 data-[hover=true]:bg-warning-50 data-[hover=true]:border-warning'
      },
      secondary: {
        inputWrapper: 'border-divider-300 data-[hover=true]:bg-secondary-50 data-[hover=true]:border-secondary'
      }
    },
    variant: {
      bordered: {
        base: 'data-[has-label=true]:mt-0'
      }
    }
  },
  defaultVariants: {
    size: 'md',
    color: 'primary',
    variant: 'bordered',
    labelPlacement: 'outside',
    radius: 'md'
  },
  compoundVariants: []
}) as typeof Input;

export default CustomInput as typeof Input;
