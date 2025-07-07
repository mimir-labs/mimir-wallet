// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { debounce } from 'lodash-es';
import { useCallback } from 'react';

export function useDebounceFn<T extends (...args: any[]) => any>(fn: T, deps: readonly any[], ms: number = 500) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useCallback(
    debounce(fn, ms),

    [fn, ...deps]
  );
}
