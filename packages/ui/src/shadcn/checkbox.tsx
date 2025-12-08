// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

'use client';

import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { CheckIcon, MinusIcon } from 'lucide-react';
import * as React from 'react';

import { cn } from '../lib/utils.js';

export type CheckboxProps = React.ComponentProps<typeof CheckboxPrimitive.Root>;

function Checkbox({ className, checked, ...props }: CheckboxProps) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        'peer border-divider size-4 shrink-0 rounded-[5px] border shadow-xs transition-shadow outline-none',
        'data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=checked]:border-primary',
        'data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground data-[state=indeterminate]:border-primary',
        'focus-visible:border-primary focus-visible:ring-primary/50 focus-visible:ring-[3px]',
        'aria-invalid:ring-danger/20 dark:aria-invalid:ring-danger/40 aria-invalid:border-danger',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      checked={checked}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="text-red grid place-content-center transition-none"
      >
        {checked === 'indeterminate' ? (
          <MinusIcon className="size-3.5" />
        ) : (
          <CheckIcon className="size-3.5" />
        )}
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
