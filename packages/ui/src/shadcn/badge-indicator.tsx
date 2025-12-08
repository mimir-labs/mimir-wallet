// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '../lib/utils.js';

const badgeIndicatorVariants = cva(
  'absolute flex items-center justify-center rounded-full text-xs font-medium pointer-events-none',
  {
    variants: {
      color: {
        primary: 'bg-primary text-primary-foreground',
        danger: 'bg-danger text-white',
        success: 'bg-success text-white',
        warning: 'bg-warning text-warning-foreground',
      },
      placement: {
        'top-right': 'top-0 right-0 translate-x-1/2 -translate-y-1/2',
        'bottom-right': 'bottom-0 right-0 translate-x-1/2 translate-y-1/2',
        'top-left': 'top-0 left-0 -translate-x-1/2 -translate-y-1/2',
        'bottom-left': 'bottom-0 left-0 -translate-x-1/2 translate-y-1/2',
      },
    },
    defaultVariants: {
      color: 'primary',
      placement: 'top-right',
    },
  },
);

export interface BadgeIndicatorProps extends VariantProps<
  typeof badgeIndicatorVariants
> {
  children: React.ReactNode;
  content?: React.ReactNode;
  isInvisible?: boolean;
  isDot?: boolean;
  className?: string;
  badgeClassName?: string;
}

function BadgeIndicator({
  children,
  content,
  color,
  placement,
  isInvisible = false,
  isDot = false,
  className,
  badgeClassName,
}: BadgeIndicatorProps) {
  const showBadge = !isInvisible;

  return (
    <div
      data-slot="badge-indicator"
      className={cn('relative inline-flex', className)}
    >
      {children}
      {showBadge && (
        <span
          data-slot="badge-indicator-badge"
          className={cn(
            badgeIndicatorVariants({ color, placement }),
            isDot ? 'size-2 min-h-2 min-w-2' : 'min-h-4 min-w-4 px-1',
            badgeClassName,
          )}
        >
          {!isDot && content}
        </span>
      )}
    </div>
  );
}

export { BadgeIndicator };
