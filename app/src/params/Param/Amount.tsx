// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ParamProps } from './types';

import { FormatBalance } from '@/components';
import React from 'react';

function Amount({ value, name }: ParamProps) {
  // Check if this is likely a balance/value field based on the parameter name
  const isLikelyBalance =
    name &&
    (name.toLowerCase().includes('value') ||
      name.toLowerCase().includes('amount') ||
      name.toLowerCase().includes('balance'));

  // For large values that look like balances (> 1 billion), use FormatBalance
  const numValue = BigInt(value.toString());
  const isLargeValue = numValue > 1000000000n;

  if (isLikelyBalance || isLargeValue) {
    return <FormatBalance value={value.toString()} withCurrency />;
  }

  return <>{value.toString()}</>;
}

export default React.memo(Amount);
