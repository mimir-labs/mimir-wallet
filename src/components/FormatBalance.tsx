// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Compact } from '@polkadot/types';

import { Box, BoxProps } from '@mui/material';
import { BN } from '@polkadot/util';
import React, { useMemo } from 'react';

import { useApi } from '@mimir-wallet/hooks';
import { formatUnits } from '@mimir-wallet/utils';

interface Props extends BoxProps {
  format?: [decimals: number, unit: string];
  label?: React.ReactNode;
  value?: Compact<any> | BN | string | number | null;
  withCurrency?: boolean;
}

const formatDisplay = (value: string, sufLen = 4): [string, string] => {
  if (value.includes('.')) {
    const [pre, suf] = value.split('.');

    return sufLen === 0 ? [pre, ''] : [pre, suf.slice(0, sufLen)];
  }

  return [value, ''];
};

function FormatBalance({ format, label, value, withCurrency, ...props }: Props): React.ReactElement<Props> {
  const { api } = useApi();
  const [major, rest] = useMemo(() => {
    const _value = formatUnits(BigInt(value?.toString() || 0), format?.[0] || api.registry.chainDecimals[0]);

    return formatDisplay(_value);
  }, [format, value, api.registry]);

  // labelPost here looks messy, however we ensure we have one less text node
  return (
    <Box component='span' sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }} {...props}>
      {label}
      <Box component='span'>
        {major}
        {rest ? <Box component='span'>.{rest}</Box> : null}
      </Box>
      <Box component='span'>{withCurrency ? ` ${format?.[1] || api.registry.chainTokens[0] || ''}` : ''}</Box>
    </Box>
  );
}

export default React.memo(FormatBalance);
