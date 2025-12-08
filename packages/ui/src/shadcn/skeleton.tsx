// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { cn } from '../lib/utils.js';

function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      className={cn('bg-secondary animate-pulse rounded-md', className)}
      {...props}
    />
  );
}

export { Skeleton };
