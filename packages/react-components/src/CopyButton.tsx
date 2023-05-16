// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { IconButton, IconButtonProps } from '@mui/material';
import React, { useCallback } from 'react';

import { IconCopy } from '@mimirdev/app-config/icons';
import { useCopyClipboard } from '@mimirdev/react-hooks';

interface Props extends IconButtonProps {
  value?: string;
}

function CopyButton({ value, ...props }: Props) {
  const [copied, copy] = useCopyClipboard();

  const handleClick = useCallback(() => {
    copy(value?.toString() || '');
  }, [copy, value]);

  return (
    <IconButton color='inherit' onClick={handleClick} size='small' sx={{ opacity: 0.7 }} {...props}>
      {copied ? 'Copied' : <IconCopy />}
    </IconButton>
  );
}

export default React.memo(CopyButton);
