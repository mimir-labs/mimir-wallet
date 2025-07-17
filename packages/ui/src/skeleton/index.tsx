// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Skeleton as HeroSkeleton, type SkeletonProps } from '@heroui/skeleton';
import { forwardRef } from '@heroui/system';

const Skeleton = forwardRef(({ className, disableAnimation = false, ...props }: SkeletonProps, ref) => {
  return (
    <HeroSkeleton
      style={
        {
          '--heroui-content3': 'var(--heroui-secondary)',
          '--heroui-content4': 'var(--heroui-primary-50)'
        } as any
      }
      className={`before:border-t-0 ${className || ''}`}
      disableAnimation={disableAnimation}
      {...props}
      ref={ref}
    />
  );
});

export default Skeleton as typeof HeroSkeleton;
