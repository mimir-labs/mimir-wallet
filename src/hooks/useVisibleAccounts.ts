// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { getAddressMeta } from '@mimir-wallet/utils';
import { useMemo } from 'react';

import { createNamedHook } from './createNamedHook';
import { useAccounts } from './useAccounts';

function useVisibleAccountsImpl(others?: string[]): string[] {
  const { allAccounts } = useAccounts();

  return useMemo(
    () =>
      allAccounts
        .filter((value) => {
          const meta = getAddressMeta(value);

          return meta.isMultisig ? !meta.isHidden && meta.isValid : true;
        })
        .concat(others || []),
    [others, allAccounts]
  );
}

export const useVisibleAccounts = createNamedHook('useVisibleAccounts', useVisibleAccountsImpl);
