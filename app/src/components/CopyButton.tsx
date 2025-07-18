// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import IconCopy from '@/assets/svg/icon-copy.svg?react';
import IconSuccess from '@/assets/svg/icon-success.svg?react';
import { useCopyClipboard } from '@/hooks/useCopyClipboard';
import React, { forwardRef, useCallback } from 'react';

import { Button, type ButtonProps, type PressEvent } from '@mimir-wallet/ui';

interface Props extends ButtonProps {
  value?: string;
}

const CopyButton = forwardRef<HTMLButtonElement, Props>(function CopyButton({ value, ...props }, ref) {
  const [copied, copy] = useCopyClipboard();

  const handleClick = useCallback(
    (e: PressEvent) => {
      copy(value?.toString() || '');
      props.onPress?.(e);
    },
    [copy, value, props]
  );

  return (
    <Button
      isIconOnly
      size={props.size || 'sm'}
      color={props.color || 'default'}
      radius={props.radius || 'full'}
      variant={props.variant || 'light'}
      {...props}
      onPress={handleClick}
      onClick={(e) => {
        e.preventDefault();
      }}
      ref={ref}
      className={'h-5 min-h-[0px] w-5 min-w-[0px] opacity-50'.concat(props.className || '')}
    >
      {copied ? <IconSuccess className='h-4 w-4' /> : <IconCopy className='h-4 w-4' />}
    </Button>
  );
});

export default React.memo(CopyButton);
