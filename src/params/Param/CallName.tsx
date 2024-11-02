// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Call } from '@polkadot/types/interfaces';
import type { ParamProps } from './types';

import React from 'react';

function CallName({ value }: ParamProps) {
  const call = value as Call;
  const { method, section } = call.registry.findMetaCall(call.callIndex);

  if (section && method) {
    return `${section}.${method}`;
  }

  return null;
}

export default React.memo(CallName);
