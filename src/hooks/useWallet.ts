// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { WalletState } from '@mimir-wallet/providers/types';

import { useContext } from 'react';

import { WalletCtx } from '@mimir-wallet/providers';

import { createNamedHook } from './createNamedHook';

function useWalletImpl(): WalletState {
  return useContext(WalletCtx);
}

export const useWallet = createNamedHook('useWallet', useWalletImpl);
