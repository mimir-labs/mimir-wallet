// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import IconQuestion from '@/assets/svg/icon-question-fill.svg?react';
import React from 'react';

import { Tooltip } from '@mimir-wallet/ui';

function Label({ children, tooltip }: { children: React.ReactNode; tooltip?: string }) {
  if (!tooltip) {
    return children;
  }

  return (
    <span className='inline-flex items-center gap-[5px]'>
      {children}
      <Tooltip closeDelay={0} classNames={{ content: 'max-w-[300px]' }} content={tooltip}>
        <IconQuestion className='text-primary' />
      </Tooltip>
    </span>
  );
}

export default Label;
