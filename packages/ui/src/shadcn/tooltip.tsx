// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

'use client';

import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '../lib/utils.js';

function TooltipProvider({ delayDuration = 0, ...props }: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return <TooltipPrimitive.Provider data-slot='tooltip-provider' delayDuration={delayDuration} {...props} />;
}

function TooltipWrapper({ ...props }: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return (
    <TooltipProvider>
      <TooltipPrimitive.Root data-slot='tooltip' {...props} />
    </TooltipProvider>
  );
}

function TooltipTrigger({ ...props }: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot='tooltip-trigger' {...props} />;
}

function TooltipContent({
  className,
  sideOffset = 5,
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot='tooltip-content'
        sideOffset={sideOffset}
        className={cn(
          'animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 shadow-medium z-50 w-fit origin-(--radix-tooltip-content-transform-origin) rounded-[10px] px-3 py-1',
          className
        )}
        {...props}
      >
        {children}
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}

// Simplified Tooltip component
const tooltipVariants = cva('z-50 w-fit origin-(--radix-tooltip-content-transform-origin) rounded-[10px] px-3 py-1.5', {
  variants: {
    color: {
      default: 'bg-background text-foreground',
      foreground: 'bg-foreground text-white'
    }
  },
  defaultVariants: {
    color: 'default'
  }
});

interface TooltipProps extends VariantProps<typeof tooltipVariants> {
  content?: React.ReactNode;
  children: React.ReactNode;
  classNames?: {
    content?: string;
  };
}

const Tooltip = React.forwardRef<React.ElementRef<typeof TooltipContent>, TooltipProps>(
  ({ content, color, classNames, children, ...props }, ref) => {
    if (!content) {
      return children;
    }

    return (
      <TooltipWrapper>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent ref={ref} className={cn(tooltipVariants({ color }), classNames?.content)} {...props}>
          {content}
        </TooltipContent>
      </TooltipWrapper>
    );
  }
);

Tooltip.displayName = 'Tooltip';

export { Tooltip };
