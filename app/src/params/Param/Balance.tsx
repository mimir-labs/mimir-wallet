// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ParamProps } from './types';

import React from 'react';

import { FormatBalance } from '@/components';

function Balance({ value }: ParamProps) {
  return <FormatBalance value={value.toString()} withCurrency />;
}

export default React.memo(Balance);
