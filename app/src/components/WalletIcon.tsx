// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { walletConfig } from '@/config';
import { Box, type BoxProps } from '@mui/material';
import React from 'react';

interface Props extends BoxProps {
  disabled: boolean;
  id: string;
}

function WalletIcon({ disabled, id, ...props }: Props) {
  const icon = walletConfig[id].icon;
  const disabledIcon = walletConfig[id].disabledIcon;

  return <Box component='img' src={disabled ? disabledIcon : icon} {...props} />;
}

export default React.memo(WalletIcon);
