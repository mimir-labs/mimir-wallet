// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';

function Cell({ title, children, img }: { img: React.ReactNode; title: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className='flex justify-between items-center gap-2.5 bg-secondary rounded-medium p-2.5 mt-2'>
      <div className='flex-1'>
        <div className='font-bold'>{title}</div>
        <div className='flex items-center gap-2.5'>
          <span className='text-foreground/50 text-small'>Powered by</span>
          {img}
        </div>
      </div>
      {children}
    </div>
  );
}

export default React.memo(Cell);
