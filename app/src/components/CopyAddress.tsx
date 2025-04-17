// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useCopyAddress } from '@/hooks/useCopyAddress';
import React, { forwardRef, useCallback } from 'react';

import { type ButtonProps } from '@mimir-wallet/ui';

import CopyButton from './CopyButton';
import { toastSuccess } from './utils';

interface Props extends ButtonProps {
  address: string;
}

const CopyAddress = forwardRef<HTMLButtonElement, Props>(function CopyAddress({ address, ...props }, ref) {
  const { open } = useCopyAddress();

  const handleClick = useCallback(() => {
    toastSuccess('Address copied!');
    open(address);
  }, [open, address]);

  return <CopyButton {...props} onPress={handleClick} ref={ref} value={address} />;
});

export default React.memo(CopyAddress);
