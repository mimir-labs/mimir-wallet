// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '../lib/utils.js';

const alertVariants = cva(
  'relative w-full rounded-[10px] p-2.5 text-sm grid has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] grid-cols-[0_1fr] has-[>svg]:gap-x-[5px] gap-y-[10px] items-start [&>svg]:size-4 [&>svg]:text-current',
  {
    variants: {
      variant: {
        default: 'bg-primary/10 text-primary',
        destructive: 'bg-danger/10 text-danger',
        success: 'bg-success/10 text-success',
        warning: 'bg-warning/10 text-warning'
      }
    },
    defaultVariants: {
      variant: 'default'
    }
  }
);

function Alert({
  className,
  variant,
  children,
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof alertVariants>) {
  return (
    <div data-slot='alert' role='alert' className={cn(alertVariants({ variant }), className)} {...props}>
      <svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16' fill='none'>
        <path
          fill-rule='evenodd'
          clip-rule='evenodd'
          d='M14.4016 7.99961C14.4016 11.5342 11.5362 14.3996 8.00156 14.3996C4.46694 14.3996 1.60156 11.5342 1.60156 7.99961C1.60156 4.46499 4.46694 1.59961 8.00156 1.59961C11.5362 1.59961 14.4016 4.46499 14.4016 7.99961ZM8.80156 5.19961C8.80156 5.64144 8.44339 5.99961 8.00156 5.99961C7.55973 5.99961 7.20156 5.64144 7.20156 5.19961C7.20156 4.75778 7.55973 4.39961 8.00156 4.39961C8.44339 4.39961 8.80156 4.75778 8.80156 5.19961ZM8.00156 6.79961C7.55973 6.79961 7.20156 7.15778 7.20156 7.59961V10.7996C7.20156 11.2414 7.55973 11.5996 8.00156 11.5996C8.44339 11.5996 8.80156 11.2414 8.80156 10.7996V7.59961C8.80156 7.15778 8.44339 6.79961 8.00156 6.79961Z'
          fill='currentColor'
        />
      </svg>
      {children}
    </div>
  );
}

function AlertTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot='alert-title' className={cn('flex-1 text-sm/4 font-bold', className)} {...props} />;
}

function AlertDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='alert-description'
      className={cn(
        'text-foreground/50 col-start-2 grid justify-items-start gap-1 text-sm [&_p]:leading-relaxed',
        className
      )}
      {...props}
    />
  );
}

export { Alert, AlertTitle, AlertDescription };
