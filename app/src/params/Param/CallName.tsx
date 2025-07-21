// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { IMethod } from '@polkadot/types/types';

import React, { useMemo } from 'react';

function CallName({ value }: { value: IMethod }) {
  return useMemo(() => {
    try {
      const { method, section } = value.registry.findMetaCall(value.callIndex);

      if (section && method) {
        return `${section}.${method}`;
      }

      return 'Unknown';
    } catch {
      return 'Unknown';
    }
  }, [value.callIndex, value.registry]);
}

export default React.memo(CallName);
