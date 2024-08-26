// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Compact } from '@polkadot/types';
import type { Registry } from '@polkadot/types/types';

import { Box } from '@mui/material';
import { BN, formatBalance, isString } from '@polkadot/util';
import React, { useMemo } from 'react';

import { useApi } from '@mimir-wallet/hooks';

interface Props {
  children?: React.ReactNode;
  className?: string;
  format?: [decimals: number, unit: string];
  formatIndex?: number;
  isShort?: boolean;
  label?: React.ReactNode;
  labelPost?: LabelPost;
  value?: Compact<any> | BN | string | number | null;
  withCurrency?: boolean;
  withSi?: boolean;
}

// for million, 2 * 3-grouping + comma
const M_LENGTH = 6 + 1;
const K_LENGTH = 3 + 1;

type LabelPost = string | React.ReactNode;

function getFormat(registry: Registry, formatIndex = 0): [number, string] {
  const decimals = registry.chainDecimals;
  const tokens = registry.chainTokens;

  return [
    formatIndex < decimals.length ? decimals[formatIndex] : decimals[0],
    formatIndex < tokens.length ? tokens[formatIndex] : tokens[1]
  ];
}

function createElement(
  prefix: string,
  postfix: string,
  unit: string,
  label: LabelPost = '',
  isShort = false
): React.ReactNode {
  return (
    <>
      {`${prefix}`}
      {!isShort && (
        <span className='FormatBalance-postfix' style={{ opacity: 0.5 }}>
          .{`0000${postfix || ''}`.slice(-4)}
        </span>
      )}
      {unit && <span className='FormatBalance-unit'> {unit}</span>}
      {label}
    </>
  );
}

function applyFormat(
  value: Compact<any> | BN | string | number,
  [decimals, token]: [number, string],
  withCurrency = true,
  withSi?: boolean,
  _isShort?: boolean,
  labelPost?: LabelPost
): React.ReactNode {
  const [prefix, postfix] = formatBalance(value, { decimals, forceUnit: '-', withSi: false }).split('.');
  const isShort = _isShort || (withSi && prefix.length >= K_LENGTH);
  const unitPost = withCurrency ? token : '';

  if (prefix.length > M_LENGTH) {
    const [major, rest] = formatBalance(value, { decimals, withUnit: false }).split('.');

    const minor = rest.substring(0, 4);
    const unit = rest.substring(4);

    return (
      <>
        {major}
        <span className='FormatBalance-postfix' style={{ opacity: 0.5 }}>
          .{minor}
        </span>
        {unit && (
          <span className='FormatBalance-unit'>
            {unit}
            {unit ? unitPost : ` ${unitPost}`}
          </span>
        )}
        {labelPost || ''}
      </>
    );
  }

  return createElement(prefix, postfix, unitPost, labelPost, isShort);
}

function FormatBalance({
  children,
  className = '',
  format,
  formatIndex,
  isShort,
  label,
  labelPost,
  value,
  withCurrency,
  withSi
}: Props): React.ReactElement<Props> {
  const { api } = useApi();

  const formatInfo = useMemo(() => format || getFormat(api.registry, formatIndex), [api, format, formatIndex]);

  // labelPost here looks messy, however we ensure we have one less text node
  return (
    <Box className={`${className} FormatBalance`} component='span'>
      {label ? <>{label}&nbsp;</> : ''}
      <span className='FormatBalance-value --digits' data-testid='balance-summary'>
        {value ? (
          value === 'all' ? (
            <>
              everything
              {labelPost || ''}
            </>
          ) : (
            applyFormat(value, formatInfo, withCurrency, withSi, isShort, labelPost)
          )
        ) : isString(labelPost) ? (
          `-${labelPost.toString()}`
        ) : (
          labelPost
        )}
      </span>
      {children}
    </Box>
  );
}

export default React.memo(FormatBalance);
