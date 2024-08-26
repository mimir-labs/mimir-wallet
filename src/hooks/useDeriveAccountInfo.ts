// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { DeriveAccountInfo } from '@polkadot/api-derive/types';
import type { AccountId, AccountIndex, Address } from '@polkadot/types/interfaces';

import { createNamedHook } from './createNamedHook';
import { useApi } from './useApi';
import { useCall } from './useCall';

function useDeriveAccountInfoImpl(
  value?: AccountId | AccountIndex | Address | Uint8Array | string | null
): DeriveAccountInfo | undefined {
  const { api } = useApi();

  return useCall<DeriveAccountInfo>(api && api.derive.accounts.info, [value]);
}

export const useDeriveAccountInfo = createNamedHook('useDeriveAccountInfo', useDeriveAccountInfoImpl);
