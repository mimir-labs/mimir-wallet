// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';

function Cell({ title, children, img }: { img: React.ReactNode; title: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className='bg-secondary mt-2 flex items-center justify-between gap-2.5 rounded-[10px] p-2.5'>
      <div className='flex-1'>
        <div className='font-bold'>{title}</div>
        <div className='flex items-center gap-2.5'>
          <span className='text-foreground/50 text-sm'>Powered by</span>
          {img}
        </div>
      </div>
      {children}
    </div>
  );
}

export default React.memo(Cell);
