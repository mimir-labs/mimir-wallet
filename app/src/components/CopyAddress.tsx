// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { type ButtonProps } from '@mimir-wallet/ui';
import React, { forwardRef } from 'react';

import CopyButton from './CopyButton';

import { useCopyAddressToClipboard } from '@/hooks/useCopyAddress';

interface Props extends ButtonProps {
  address: string;
}

const CopyAddress = forwardRef<HTMLButtonElement, Props>(function CopyAddress({ address, ...props }, ref) {
  const copyAddress = useCopyAddressToClipboard(address);

  return <CopyButton {...props} onClick={() => copyAddress()} ref={ref} value={address} />;
});

export default React.memo(CopyAddress);
