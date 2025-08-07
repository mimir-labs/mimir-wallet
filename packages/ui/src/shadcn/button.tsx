// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '../lib/utils.js';
import { colorVariants } from '../lib/variants.js';

const buttonVariants = cva(
  [
    'z-0',
    'group',
    'relative',
    'inline-flex',
    'items-center',
    'justify-center',
    'box-border',
    'appearance-none',
    'outline-hidden',
    'select-none',
    'whitespace-nowrap',
    'min-w-max',
    'font-normal',
    'subpixel-antialiased',
    'overflow-hidden',
    'tap-highlight-transparent',
    'touch-manipulation',
    'transform-gpu active:scale-[0.97]',
    'transition-transform-colors-opacity motion-reduce:transition-none',
    'disabled:pointer-events-none disabled:not-has-[.button-spinner]:bg-divider-300 disabled:not-has-[.button-spinner]:border-divider-300 disabled:not-has-[.button-spinner]:text-white'
  ],
  {
    variants: {
      variant: {
        solid: '',
        bordered: 'border-1 bg-transparent',
        light: 'bg-transparent',
        flat: '',
        faded: 'border-1',
        shadow: '',
        ghost: 'border-1 bg-transparent'
      },
      size: {
        sm: 'px-2 min-w-6 h-6 text-xs gap-2',
        md: 'px-3 min-w-8 h-8 text-sm gap-2',
        lg: 'px-4 min-w-10 h-10 text-base gap-3'
      },
      color: {
        primary: '',
        secondary: '',
        success: '',
        warning: '',
        danger: ''
      },
      radius: {
        none: 'rounded-none',
        sm: 'rounded-[5px]',
        md: 'rounded-[10px]',
        lg: 'rounded-[20px]',
        full: 'rounded-full'
      },
      fullWidth: {
        true: 'w-full'
      },
      isIconOnly: {
        true: 'min-w-0 px-0 px-0 !gap-0',
        false: '[&>svg]:max-w-[theme(spacing.8)]'
      }
    },
    compoundVariants: [
      // solid / color
      {
        variant: 'solid',
        color: 'primary',
        class: colorVariants.solid.primary
      },
      {
        variant: 'solid',
        color: 'secondary',
        class: colorVariants.solid.secondary
      },
      {
        variant: 'solid',
        color: 'success',
        class: colorVariants.solid.success
      },
      {
        variant: 'solid',
        color: 'warning',
        class: colorVariants.solid.warning
      },
      {
        variant: 'solid',
        color: 'danger',
        class: colorVariants.solid.danger
      },
      // shadow / color
      {
        variant: 'shadow',
        color: 'primary',
        class: colorVariants.shadow.primary
      },
      {
        variant: 'shadow',
        color: 'secondary',
        class: colorVariants.shadow.secondary
      },
      {
        variant: 'shadow',
        color: 'success',
        class: colorVariants.shadow.success
      },
      {
        variant: 'shadow',
        color: 'warning',
        class: colorVariants.shadow.warning
      },
      {
        variant: 'shadow',
        color: 'danger',
        class: colorVariants.shadow.danger
      },
      // bordered / color
      {
        variant: 'bordered',
        color: 'primary',
        class: colorVariants.bordered.primary
      },
      {
        variant: 'bordered',
        color: 'secondary',
        class: colorVariants.bordered.secondary
      },
      {
        variant: 'bordered',
        color: 'success',
        class: colorVariants.bordered.success
      },
      {
        variant: 'bordered',
        color: 'warning',
        class: colorVariants.bordered.warning
      },
      {
        variant: 'bordered',
        color: 'danger',
        class: colorVariants.bordered.danger
      },
      // flat / color
      {
        variant: 'flat',
        color: 'primary',
        class: colorVariants.flat.primary
      },
      {
        variant: 'flat',
        color: 'secondary',
        class: colorVariants.flat.secondary
      },
      {
        variant: 'flat',
        color: 'success',
        class: colorVariants.flat.success
      },
      {
        variant: 'flat',
        color: 'warning',
        class: colorVariants.flat.warning
      },
      {
        variant: 'flat',
        color: 'danger',
        class: colorVariants.flat.danger
      },
      // faded / color
      {
        variant: 'faded',
        color: 'primary',
        class: colorVariants.faded.primary
      },
      {
        variant: 'faded',
        color: 'secondary',
        class: colorVariants.faded.secondary
      },
      {
        variant: 'faded',
        color: 'success',
        class: colorVariants.faded.success
      },
      {
        variant: 'faded',
        color: 'warning',
        class: colorVariants.faded.warning
      },
      {
        variant: 'faded',
        color: 'danger',
        class: colorVariants.faded.danger
      },
      // light / color
      {
        variant: 'light',
        color: 'primary',
        class: [colorVariants.light.primary, 'hover:bg-primary/20']
      },
      {
        variant: 'light',
        color: 'secondary',
        class: [colorVariants.light.secondary, 'hover:bg-secondary/20']
      },
      {
        variant: 'light',
        color: 'success',
        class: [colorVariants.light.success, 'hover:bg-success/20']
      },
      {
        variant: 'light',
        color: 'warning',
        class: [colorVariants.light.warning, 'hover:bg-warning/20']
      },
      {
        variant: 'light',
        color: 'danger',
        class: [colorVariants.light.danger, 'hover:bg-danger/20']
      },
      // ghost / color
      {
        variant: 'ghost',
        color: 'primary',
        class: [colorVariants.ghost.primary, 'hover:!bg-primary hover:!text-primary-foreground']
      },
      {
        variant: 'ghost',
        color: 'secondary',
        class: [colorVariants.ghost.secondary, 'hover:!bg-secondary hover:!text-secondary-foreground']
      },
      {
        variant: 'ghost',
        color: 'success',
        class: [colorVariants.ghost.success, 'hover:!bg-success hover:!text-success-foreground']
      },
      {
        variant: 'ghost',
        color: 'warning',
        class: [colorVariants.ghost.warning, 'hover:!bg-warning hover:!text-warning-foreground']
      },
      {
        variant: 'ghost',
        color: 'danger',
        class: [colorVariants.ghost.danger, 'hover:!bg-danger hover:!text-danger-foreground']
      },
      {
        isIconOnly: true,
        size: 'sm',
        class: 'w-6 h-6'
      },
      {
        isIconOnly: true,
        size: 'md',
        class: 'w-8 h-8'
      },
      {
        isIconOnly: true,
        size: 'lg',
        class: 'w-10 h-10'
      },
      // variant / hover
      {
        variant: ['solid', 'faded', 'flat', 'bordered', 'shadow'],
        class: 'hover:opacity-hover'
      }
    ],
    defaultVariants: {
      variant: 'solid',
      isIconOnly: false,
      size: 'md',
      radius: 'full',
      color: 'primary'
    }
  }
);

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'color'>,
    VariantProps<typeof buttonVariants> {
  continuePropagation?: boolean;
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      color,
      size,
      radius,
      fullWidth,
      isIconOnly,
      continuePropagation,
      asChild = false,
      onClick,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button';

    return (
      <Comp
        className={cn(buttonVariants({ variant, color, size, radius, isIconOnly, fullWidth }), className)}
        ref={ref}
        onClick={
          !continuePropagation
            ? (e) => {
                e.stopPropagation();
                onClick?.(e);
              }
            : onClick
        }
        {...props}
      >
        {children}
      </Comp>
    );
  }
);

Button.displayName = 'Button';

export { Button };
