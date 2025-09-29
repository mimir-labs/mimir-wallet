// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { HTMLAttributes } from 'react';

import { cn } from '@mimir-wallet/ui';

export type LoaderProps = HTMLAttributes<HTMLDivElement> & {
  size?: number;
  text?: string;
  showText?: boolean;
};

export const Loader = ({ className, size = 10, text = 'Thinking', showText = true, ...props }: LoaderProps) => (
  <div className={cn('flex items-center justify-start gap-[5px]', className)} {...props}>
    <div className='bg-primary animate-pulse rounded-full' style={{ width: size, height: size }} />
    {showText && (
      <span className='text-foreground animate-dots font-normal whitespace-nowrap' style={{ lineHeight: 'normal' }}>
        {text}
      </span>
    )}
  </div>
);
