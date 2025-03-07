// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ParamProps } from './types';

import { FormatBalance } from '@/components';
import React from 'react';

function Balance({ value }: ParamProps) {
  return <FormatBalance value={value.toString()} />;
}

export default React.memo(Balance);
