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
}

function FormatBalance({ format, label, value, withCurrency, ...props }: Props): React.ReactElement<Props> {
  const { api } = useApi();
  const decimals = format?.[0] ?? api.registry.chainDecimals[0];
  const currency = format?.[1] ?? api.registry.chainTokens[0];
  const [major, rest, unit] = useMemo(() => {
    const _value = formatUnits(BigInt(value?.toString() || 0), decimals || 0);

    return formatDisplay(_value);
  }, [value, decimals]);

  // labelPost here looks messy, however we ensure we have one less text node
  return (
    <span className='inline-flex items-center gap-1' {...props}>
      {label}
      <span>
        {major}
        {rest ? <span>.{rest}</span> : null}
        {unit || ''}
      </span>
      <span>{withCurrency ? ` ${currency}` : ''}</span>
    </span>
  );
}

export default React.memo(FormatBalance);
