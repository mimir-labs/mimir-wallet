// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import IconCopy from '@/assets/svg/icon-copy.svg?react';
import IconSuccess from '@/assets/svg/icon-success.svg?react';
import { useCopyClipboard } from '@/hooks/useCopyClipboard';
import React, { forwardRef, useCallback } from 'react';

import { Button, type ButtonProps, type PressEvent } from '@mimir-wallet/ui';

interface Props extends ButtonProps {
  value?: string;
  mode?: 'icon' | 'text';
}

const CopyButton = forwardRef<HTMLButtonElement, Props>(function CopyButton(
  { value, mode = 'icon', children, className = '', ...props },
  ref
) {
  const [copied, copy] = useCopyClipboard();

  const handleClick = useCallback(
    (e: PressEvent) => {
      copy(value?.toString() || '');
      props.onPress?.(e);
    },
    [copy, value, props]
  );

  const isIconMode = mode === 'icon';

  return (
    <Button
      isIconOnly={isIconMode}
      size={props.size || 'sm'}
      color={props.color || 'default'}
      radius={isIconMode ? props.radius || 'full' : props.radius}
      variant={props.variant || 'light'}
      {...props}
      onPress={handleClick}
      ref={ref}
      className={isIconMode ? 'h-5 min-h-[0px] w-5 min-w-[0px] opacity-50'.concat(` ${className}`) : className}
    >
      {isIconMode ? (
        copied ? (
          <IconSuccess className='h-4 w-4' />
        ) : (
          <IconCopy className='h-4 w-4' />
        )
      ) : copied ? (
        'Copied!'
      ) : (
        children
      )}
    </Button>
  );
});

export default React.memo(CopyButton);
