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
        <label className='text-small font-bold'>{name}</label>

        <div className='bg-secondary rounded-medium p-2.5'>{content}</div>
      </div>
    );
  }

  return (
    <div className='text-tiny grid w-full grid-cols-10 gap-2.5'>
      <div className='col-span-2 flex items-center font-bold'>{name}</div>
      <div className='text-foreground/65 col-span-8 flex items-center font-bold'>{content}</div>
    </div>
  );
}

export default React.memo(Item);
