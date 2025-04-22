// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiContextProps } from './types.js';

import { useContext } from 'react';

import { ApiContext, SubApiContext } from './context.js';

export function useApi(): ApiContextProps & { isSub: boolean } {
  const subValue = useContext(SubApiContext);
  const value = useContext(ApiContext);

  if (subValue) {
    return { ...subValue, chainSS58: value.chainSS58, isSub: true };
  }

  return {
    ...value,
    chainSS58: value.chainSS58,
    isSub: false
  };
}
