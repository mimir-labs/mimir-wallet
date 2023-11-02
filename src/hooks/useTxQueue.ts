// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useContext } from 'react';

import { TxQueueCtx, TxState } from './ctx/TxQueue';
import { createNamedHook } from './createNamedHook';

function useTxQueueImpl(): TxState {
  return useContext(TxQueueCtx);
}

export const useTxQueue = createNamedHook('useTxQueue', useTxQueueImpl);
