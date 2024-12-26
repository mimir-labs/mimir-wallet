// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { IconButton, type IconButtonProps, SvgIcon } from '@mui/material';
import React, { forwardRef, useCallback } from 'react';

import IconCopy from '@mimir-wallet/assets/svg/icon-copy.svg?react';
import IconSuccess from '@mimir-wallet/assets/svg/icon-success.svg?react';
import { useCopyClipboard } from '@mimir-wallet/hooks/useCopyClipboard';

interface Props extends IconButtonProps {
  value?: string;
}

const CopyButton = forwardRef<HTMLButtonElement, Props>(function CopyButton({ value, ...props }, ref) {
  const [copied, copy] = useCopyClipboard();

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      copy(value?.toString() || '');
    },
    [copy, value]
  );

  return (
    <IconButton color='inherit' onClick={handleClick} size='small' sx={{ opacity: 0.7 }} {...props} ref={ref}>
      <SvgIcon component={copied ? IconSuccess : IconCopy} inheritViewBox />
    </IconButton>
  );
});

export default React.memo(CopyButton);
