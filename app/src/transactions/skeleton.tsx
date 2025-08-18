// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Skeleton } from '@mimir-wallet/ui';

export const skeleton = (
  <div className='space-y-5'>
    {Array.from({ length: 3 }).map((_, index) => (
      <div className='bg-content1 shadow-medium space-y-5 rounded-[20px] p-4 sm:p-5' key={index}>
        <Skeleton className='h-[118px] w-full rounded-[10px]' />
        <Skeleton className='h-[20px] w-full rounded-[5px]' />
        <Skeleton className='h-[20px] w-full rounded-[5px]' />
        <Skeleton className='h-[20px] w-full rounded-[5px]' />
      </div>
    ))}
  </div>
);
