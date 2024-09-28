// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Compact } from '@polkadot/types';

import { Box, BoxProps } from '@mui/material';
import { BN } from '@polkadot/util';
import React, { useMemo } from 'react';

import { registry } from '@mimir-wallet/api';

interface Props extends BoxProps {
  format?: [decimals: number, unit: string];
  label?: React.ReactNode;
  value?: Compact<any> | BN | string | number | null;
  withCurrency?: boolean;
}

export function formatUnits(value: bigint, decimals: number) {
  let display = value.toString();

  const negative = display.startsWith('-');

  if (negative) display = display.slice(1);

  display = display.padStart(decimals, '0');

  const results = [display.slice(0, display.length - decimals), display.slice(display.length - decimals)];

  const integer = results[0];
  const fraction = results[1].replace(/(0+)$/, '');

  return `${negative ? '-' : ''}${integer || '0'}${fraction ? `.${fraction}` : ''}`;
}

const formatDisplay = (value: string, sufLen = 4): [string, string] => {
  if (value.includes('.')) {
    const [pre, suf] = value.split('.');

    return sufLen === 0 ? [pre, ''] : [pre, suf.slice(0, sufLen)];
  }

  return [value, ''];
};

function FormatBalance({ format, label, value, withCurrency, ...props }: Props): React.ReactElement<Props> {
  const [major, rest] = useMemo(() => {
    const _value = formatUnits(BigInt(value?.toString() || 0), format?.[0] || registry.chainDecimals[0]);

    return formatDisplay(_value);
  }, [format, value]);

  // labelPost here looks messy, however we ensure we have one less text node
  return (
    <Box component='span' sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }} {...props}>
      {label}
      <Box component='span'>
        {major}
        {rest ? (
          <Box component='span' style={{ opacity: 0.7 }}>
            .{rest}
          </Box>
        ) : null}
      </Box>
      <Box component='span'>{withCurrency ? ` ${format?.[1] || registry.chainTokens[0] || ''}` : ''}</Box>
    </Box>
  );
}

export default React.memo(FormatBalance);
