// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { DappOption, dapps } from '@mimir-wallet/config';
import { useMemo } from 'react';

export function useDapp(website?: string): DappOption | undefined {
  return useMemo(() => {
    if (!website) return undefined;

    return dapps.find((item) => {
      if (item.internal) return false;

      const urlIn = new URL(website);
      const urlThis = new URL(item.url);

      return urlIn.origin === urlThis.origin;
    });
  }, [website]);
}
