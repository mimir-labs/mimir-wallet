// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { TxState } from '@mimir-wallet/providers/types';

import { useContext } from 'react';

import { TxQueueCtx } from '@mimir-wallet/providers';

import { createNamedHook } from './createNamedHook';

function useTxQueueImpl(): TxState {
  return useContext(TxQueueCtx);
}

export const useTxQueue = createNamedHook('useTxQueue', useTxQueueImpl);
