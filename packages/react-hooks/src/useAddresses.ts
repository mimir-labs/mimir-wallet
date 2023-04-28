// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Addresses } from './ctx/types';

import { useContext } from 'react';

import { KeyringCtx } from './ctx/Keyring';
import { createNamedHook } from './createNamedHook';

function useAddressesImpl(): Addresses {
  return useContext(KeyringCtx).addresses;
}

export const useAddresses = createNamedHook('useAddresses', useAddressesImpl);
