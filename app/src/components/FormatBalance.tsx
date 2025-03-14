// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Compact } from '@polkadot/types';
import type { BN } from '@polkadot/util';

import { useApi } from '@/hooks/useApi';
import { useAssetInfo } from '@/hooks/useAssets';
import { formatDisplay, formatUnits } from '@/utils';
import { Box, type BoxProps } from '@mui/material';
import React, { useMemo } from 'react';

interface Props extends BoxProps {
  format?: [decimals: number, symbol: string];
  label?: React.ReactNode;
  value?: Compact<any> | BN | string | number | null;
  withCurrency?: boolean;
  assetId?: string;
}

function FormatBalance({ format, label, value, withCurrency, assetId, ...props }: Props): React.ReactElement<Props> {
  const { api } = useApi();
  const [assetInfo] = useAssetInfo(assetId);
  const decimals = format?.[0] ?? (assetId ? assetInfo?.decimals : api.registry.chainDecimals[0]);
  const currency = format?.[1] ?? (assetId ? assetInfo?.symbol : api.registry.chainTokens[0]);
  const [major, rest, unit] = useMemo(() => {
    const _value = formatUnits(BigInt(value?.toString() || 0), decimals || 0);

    return formatDisplay(_value);
  }, [value, decimals]);

  // labelPost here looks messy, however we ensure we have one less text node
  return (
    <Box component='span' sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }} {...props}>
      {label}
      <Box component='span'>
        {major}
        {rest ? <Box component='span'>.{rest}</Box> : null}
        {unit || ''}
      </Box>
      <Box component='span'>{withCurrency ? ` ${currency}` : ''}</Box>
    </Box>
  );
}

export default React.memo(FormatBalance);
