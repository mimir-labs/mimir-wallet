// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Accounts } from './ctx/types';

import { useContext } from 'react';

import { KeyringCtx } from './ctx/Keyring';
import { createNamedHook } from './createNamedHook';

function useAccountsImpl(): Accounts {
  return useContext(KeyringCtx).accounts;
}

export const useAccounts = createNamedHook('useAccounts', useAccountsImpl);
