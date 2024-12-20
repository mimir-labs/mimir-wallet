// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { IconButton, type IconButtonProps, SvgIcon } from '@mui/material';
import React, { useCallback } from 'react';

import IconCopy from '@mimir-wallet/assets/svg/icon-copy.svg?react';
import IconSuccess from '@mimir-wallet/assets/svg/icon-success.svg?react';
import { useCopyClipboard } from '@mimir-wallet/hooks';

interface Props extends IconButtonProps {
  value?: string;
}

function CopyButton({ value, ...props }: Props) {
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
    <IconButton color='inherit' onClick={handleClick} size='small' sx={{ opacity: 0.7 }} {...props}>
      <SvgIcon component={copied ? IconSuccess : IconCopy} inheritViewBox />
    </IconButton>
  );
}

export default React.memo(CopyButton);
