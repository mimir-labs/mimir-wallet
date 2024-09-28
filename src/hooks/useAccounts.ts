// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useContext } from 'react';

import { AddressCtx } from '@mimir-wallet/providers';

export function useAccount() {
  return useContext(AddressCtx);
}
