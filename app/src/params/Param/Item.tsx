// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';

interface Props {
  type?: 'horizontal' | 'vertical';
  name?: React.ReactNode;
  content?: React.ReactNode;
}

function Item({ content, name, type = 'horizontal' }: Props) {
  if (type === 'vertical') {
    return (
      <div className='space-y-1'>
        <label className='font-bold text-small'>{name}</label>

        <div className='p-2.5 bg-secondary rounded-medium'>{content}</div>
      </div>
    );
  }

  return (
    <div className='grid grid-cols-10 gap-2.5 w-full text-tiny'>
      <div className='flex col-span-2 items-center font-bold'>{name}</div>
      <div className='flex col-span-8 items-center font-bold text-foreground/65'>{content}</div>
    </div>
  );
}

export default React.memo(Item);
