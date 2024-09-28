// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';

import { FormatBalance } from '@mimir-wallet/components';

import { ParamProps } from './types';

function Amount({ value }: ParamProps) {
  return <FormatBalance value={value.value.toString()} />;
}

export default React.memo(Amount);
