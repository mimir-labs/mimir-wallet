// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

'use client';

import { cn } from '@mimir-wallet/ui';
import { lazy, memo, Suspense } from 'react';

// Lazy load Streamdown to avoid loading shiki (~9MB) on initial page load
const LazyStreamdown = lazy(() =>
  import('streamdown').then((mod) => ({ default: mod.Streamdown })),
);

interface ResponseProps {
  children?: string;
  className?: string;
}

export const Response = memo(
  ({ className, children }: ResponseProps) => (
    <Suspense
      fallback={
        <div className="animate-pulse whitespace-pre-wrap">{children}</div>
      }
    >
      <LazyStreamdown
        className={cn(
          'size-full [&>*:first-child]:mt-0 [&>*:last-child]:mb-0',
          className,
        )}
      >
        {children}
      </LazyStreamdown>
    </Suspense>
  ),
  (prevProps, nextProps) => prevProps.children === nextProps.children,
);

Response.displayName = 'Response';
