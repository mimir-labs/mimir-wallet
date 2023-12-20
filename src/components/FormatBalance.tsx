// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Compact } from '@polkadot/types';
import type { Registry } from '@polkadot/types/types';
import type { BN } from '@polkadot/util';

import { useApi } from '@mimir-wallet/hooks';
import { Box } from '@mui/material';
import { formatBalance } from '@polkadot/util';
import React, { useMemo } from 'react';

interface Props {
  format?: [decimals: number, unit: string];
  formatIndex?: number;
  isShort?: boolean;
  value?: Compact<any> | BN | string | number | null;
  withCurrency?: boolean;
  withSi?: boolean;
}

// for million, 2 * 3-grouping + comma
const M_LENGTH = 6 + 1;
const K_LENGTH = 3 + 1;

function getFormat(registry: Registry, formatIndex = 0): [number, string] {
  const decimals = registry.chainDecimals;
  const tokens = registry.chainTokens;

  return [formatIndex < decimals.length ? decimals[formatIndex] : decimals[0], formatIndex < tokens.length ? tokens[formatIndex] : tokens[1]];
}

function createElement(prefix: string, postfix: string, unit: string, isShort = false): React.ReactNode {
  return (
    <>
      {`${prefix}${isShort ? '' : '.'}`}
      {!isShort && <span>{`0000${postfix || ''}`.slice(-4)}</span>}
      <span> {unit}</span>
    </>
  );
}

function applyFormat(value: Compact<any> | BN | string | number, [decimals, token]: [number, string], withCurrency = true, withSi?: boolean, _isShort?: boolean): React.ReactNode {
  const [prefix, postfix] = formatBalance(value, { decimals, forceUnit: '-', withSi: false }).split('.');
  const isShort = _isShort || (withSi && prefix.length >= K_LENGTH);
  const unitPost = withCurrency ? token : '';

  if (prefix.length > M_LENGTH) {
    const [major, rest] = formatBalance(value, { decimals, withUnit: false }).split('.');
    const minor = rest.substring(0, 4);
    const unit = rest.substring(4);

    return (
      <>
        {major}.<span>{minor}</span>
        <span>
          {unit}
          {unit ? unitPost : ` ${unitPost}`}
        </span>
      </>
    );
  }

  return createElement(prefix, postfix, unitPost, isShort);
}

function FormatBalance({ format, formatIndex, isShort, value, withCurrency, withSi }: Props): React.ReactElement<Props> {
  const { api } = useApi();

  const formatInfo = useMemo(() => format || getFormat(api.registry, formatIndex), [api, format, formatIndex]);

  return <Box component='span'>{applyFormat(value || '0', formatInfo, withCurrency, withSi, isShort)}</Box>;
}

export default React.memo(FormatBalance);
