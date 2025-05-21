// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Skeleton } from '@mimir-wallet/ui';

export const skeleton = (
  <div className='space-y-5'>
    {Array.from({ length: 3 }).map((_, index) => (
      <div className='space-y-5 p-4 sm:p-5 bg-content1 shadow-medium rounded-large' key={index}>
        <Skeleton className='w-full h-[118px] rounded-medium' />
        <Skeleton className='w-full h-[20px] rounded-small' />
        <Skeleton className='w-full h-[20px] rounded-small' />
        <Skeleton className='w-full h-[20px] rounded-small' />
      </div>
    ))}
  </div>
);
