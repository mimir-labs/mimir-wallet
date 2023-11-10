// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useMemo } from 'react';

import { getAddressMeta } from '@mimirdev/utils';

import { createNamedHook } from './createNamedHook';
import { useAccounts } from './useAccounts';

function useVisibleAccountsImpl(others?: string[]): string[] {
  const { allAccounts } = useAccounts();

  return useMemo(() => allAccounts.filter((value) => !getAddressMeta(value).isHidden).concat(others || []), [others, allAccounts]);
}

export const useVisibleAccounts = createNamedHook('useVisibleAccounts', useVisibleAccountsImpl);
