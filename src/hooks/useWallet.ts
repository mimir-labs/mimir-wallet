// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { WalletState } from './ctx/types';

import { useContext } from 'react';

import { createNamedHook } from './createNamedHook';
import { WalletCtx } from './ctx';

function useWalletImpl(): WalletState {
  return useContext(WalletCtx);
}

export const useWallet = createNamedHook('useWallet', useWalletImpl);
