// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Skeleton } from '@mimir-wallet/ui';

export const skeleton = (
  <div className='space-y-5'>
    {Array.from({ length: 3 }).map((_, index) => (
      <div
        className='bg-background border-secondary flex flex-col gap-3 rounded-[20px] border-1 p-5 shadow-md'
        key={index}
      >
        {/* Date label skeleton */}
        <Skeleton className='h-5 w-24 rounded-[5px]' />
        {/* Transaction rows skeleton */}
        <div className='space-y-3'>
          <Skeleton className='h-10 w-full rounded-[10px]' />
          <Skeleton className='h-10 w-full rounded-[10px]' />
          <Skeleton className='h-10 w-full rounded-[10px]' />
        </div>
      </div>
    ))}
  </div>
);
