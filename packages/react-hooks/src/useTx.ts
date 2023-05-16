// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useContext } from 'react';

import { TxCtx, TxState } from './ctx/Tx';
import { createNamedHook } from './createNamedHook';

function useTxImpl(): TxState {
  return useContext(TxCtx);
}

export const useTx = createNamedHook('useTx', useTxImpl);
