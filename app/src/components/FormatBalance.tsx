// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Compact } from '@polkadot/types';
import type { BN } from '@polkadot/util';

import { formatDisplay, formatUnits } from '@/utils';
import React, { useMemo } from 'react';

import { useApi } from '@mimir-wallet/polkadot-core';

interface Props extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement> {
  format?: [decimals: number, symbol: string];
  label?: React.ReactNode;
  value?: Compact<any> | BN | bigint | string | number | null;
  withCurrency?: boolean;
  icon?: React.ReactNode;
}

function FormatBalance({
  format,
  label,
  value,
  withCurrency,
  icon,
  className = '',
  ...props
}: Props): React.ReactElement<Props> {
  const { api } = useApi();
  // Get decimals with fallback to DOT's standard 10 decimals
  const decimals = format?.[0] ?? (api.registry.chainDecimals?.[0] || 10);
  const currency = format?.[1] ?? (api.registry.chainTokens?.[0] || 'DOT');

  const [major, rest, unit] = useMemo(() => {
    // Ensure valid decimals, default to 10 for DOT if not available
    const finalDecimals = typeof decimals === 'number' && decimals > 0 ? decimals : 10;
    const _value = formatUnits(BigInt(value?.toString() || 0), finalDecimals);

    return formatDisplay(_value);
  }, [value, decimals]);

  // labelPost here looks messy, however we ensure we have one less text node
  return (
    <span className={`inline-flex items-center gap-1 ${className}`} {...props}>
      {label}
      <span>
        {major}
        {rest ? <span>.{rest}</span> : null}
        {unit || ''}
      </span>
      {icon}
      <span>{withCurrency ? ` ${currency}` : ''}</span>
    </span>
  );
}

export default React.memo(FormatBalance);
