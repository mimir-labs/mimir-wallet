// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { HexString } from '@polkadot/util/types';

import { Typography, TypographyProps } from '@mui/material';
import { isHex, isString, isU8a, stringToHex, u8aToHex } from '@polkadot/util';
import React, { useMemo } from 'react';

import CopyButton from './CopyButton';

interface Props extends TypographyProps {
  value?: string | Uint8Array | HexString | { toHex: () => string };
  length?: number;
  withCopy?: boolean;
}

function Hex({ length = 10, value, withCopy, ...props }: Props) {
  const displayValue = useMemo(() => {
    return isU8a(value) ? u8aToHex() : isHex(value) ? value : isString(value) ? stringToHex(value.toString()) : value?.toHex();
  }, [value]);

  return (
    <Typography {...props}>
      {displayValue ? `${displayValue.slice(0, length + 2)}...${displayValue.slice(-10)}` : '0x'}
      {withCopy && <CopyButton value={displayValue} />}
    </Typography>
  );
}

export default React.memo(Hex);
