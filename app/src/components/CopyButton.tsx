// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import IconCopy from '@/assets/svg/icon-copy.svg?react';
import IconSuccess from '@/assets/svg/icon-success.svg?react';
import { useCopyClipboard } from '@/hooks/useCopyClipboard';
import React, { forwardRef, useCallback } from 'react';

import { Button, type ButtonProps } from '@mimir-wallet/ui';

interface Props extends ButtonProps {
  value?: string;
}

const CopyButton = forwardRef<HTMLButtonElement, Props>(function CopyButton({ value, ...props }, ref) {
  const [copied, copy] = useCopyClipboard();

  const handleClick = useCallback(() => {
    copy(value?.toString() || '');

    return true;
  }, [copy, value]);

  return (
    <Button
      isIconOnly
      onPress={handleClick}
      size={props.size || 'sm'}
      color={props.color || 'default'}
      radius={props.radius || 'full'}
      variant={props.variant || 'light'}
      {...props}
      ref={ref}
      className={'w-5 h-5 min-w-[0px] min-h-[0px] opacity-50 '.concat(props.className || '')}
    >
      {copied ? <IconSuccess className='w-4 h-4' /> : <IconCopy className='w-4 h-4' />}
    </Button>
  );
});

export default React.memo(CopyButton);
