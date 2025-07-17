// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Skeleton } from '@mimir-wallet/ui';

export const skeleton = (
  <div className='space-y-5'>
    {Array.from({ length: 3 }).map((_, index) => (
      <div className='bg-content1 shadow-medium rounded-large space-y-5 p-4 sm:p-5' key={index}>
        <Skeleton className='rounded-medium h-[118px] w-full' />
        <Skeleton className='rounded-small h-[20px] w-full' />
        <Skeleton className='rounded-small h-[20px] w-full' />
        <Skeleton className='rounded-small h-[20px] w-full' />
      </div>
    ))}
  </div>
);
