// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';

import { walletConfig } from '@/config';

interface Props extends React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement> {
  disabled: boolean;
  id: string;
}

function WalletIcon({ disabled, id, ...props }: Props) {
  const icon = walletConfig[id].icon;
  const disabledIcon = walletConfig[id].disabledIcon;

  return <img src={disabled ? disabledIcon : icon} {...props} />;
}

export default React.memo(WalletIcon);
