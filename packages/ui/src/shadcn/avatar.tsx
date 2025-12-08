// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

'use client';

import { User } from 'lucide-react';
import * as React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { cn } from '../lib/utils.js';

type ImageLoadingStatus = 'idle' | 'loading' | 'loaded' | 'error';

export interface AvatarProps extends Omit<
  React.HTMLAttributes<HTMLSpanElement>,
  'onError'
> {
  src?: string;
  alt?: string;
  fallback?: React.ReactNode;
  showFallback?: boolean;
  onError?: () => void;
  radius?: 'none' | 'sm' | 'md' | 'lg' | 'full';
}

const radiusMap: Record<NonNullable<AvatarProps['radius']>, string> = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  full: 'rounded-full',
};

function useImageLoadingStatus(src?: string) {
  const [status, setStatus] = useState<ImageLoadingStatus>(
    src ? 'loading' : 'error',
  );
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    if (!src) {
      queueMicrotask(() => {
        if (isMountedRef.current) {
          setStatus('error');
        }
      });

      return () => {
        isMountedRef.current = false;
      };
    }

    queueMicrotask(() => {
      if (isMountedRef.current) {
        setStatus('loading');
      }
    });

    const image = new window.Image();

    image.onload = () => {
      if (isMountedRef.current) {
        setStatus('loaded');
      }
    };

    image.onerror = () => {
      if (isMountedRef.current) {
        setStatus('error');
      }
    };

    image.src = src;

    return () => {
      isMountedRef.current = false;
    };
  }, [src]);

  return status;
}

const Avatar = React.forwardRef<HTMLSpanElement, AvatarProps>(
  (
    {
      src,
      alt = '',
      fallback,
      showFallback,
      onError,
      radius = 'full',
      className,
      style,
      children,
      ...props
    },
    ref,
  ) => {
    const imageStatus = useImageLoadingStatus(src);

    const handleImageError = useCallback(() => {
      onError?.();
    }, [onError]);

    useEffect(() => {
      if (imageStatus === 'error') {
        handleImageError();
      }
    }, [imageStatus, handleImageError]);

    // Determine if fallback should be shown
    const shouldShowFallback =
      showFallback === true ||
      (showFallback !== false && imageStatus !== 'loaded');

    return (
      <span
        ref={ref}
        className={cn(
          'relative inline-flex shrink-0 items-center justify-center overflow-hidden bg-transparent',
          radiusMap[radius],
          className,
        )}
        style={style}
        {...props}
      >
        {shouldShowFallback ? (
          <span
            className={cn(
              'bg-muted text-muted-foreground flex h-full w-full items-center justify-center',
            )}
          >
            {fallback || children || <User className="h-[60%] w-[60%]" />}
          </span>
        ) : (
          <img
            src={src}
            alt={alt}
            className={cn('h-full w-full object-cover', radiusMap[radius])}
          />
        )}
      </span>
    );
  },
);

Avatar.displayName = 'Avatar';

// AvatarGroup Component
export interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  max?: number;
  total?: number;
  renderCount?: (count: number) => React.ReactNode;
}

const AvatarGroup = React.forwardRef<HTMLDivElement, AvatarGroupProps>(
  ({ max = 5, total, renderCount, className, children, ...props }, ref) => {
    const childrenArray = React.Children.toArray(children);
    const childCount = total ?? childrenArray.length;
    const visibleChildren = max ? childrenArray.slice(0, max) : childrenArray;
    const remainingCount = childCount - visibleChildren.length;

    return (
      <div ref={ref} className={cn('flex items-center', className)} {...props}>
        {visibleChildren}
        {remainingCount > 0 && renderCount && renderCount(remainingCount)}
      </div>
    );
  },
);

AvatarGroup.displayName = 'AvatarGroup';

export { Avatar, AvatarGroup };
