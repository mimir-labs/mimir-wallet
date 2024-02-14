// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable @typescript-eslint/no-empty-function */
import type { TxQueue, TxQueueState } from './types';

import React, { useCallback, useState } from 'react';

interface Props {
  children?: React.ReactNode;
}

export interface TxState {
  queue: TxQueueState[];
  addQueue: (queue: TxQueue) => void;
}

export const TxQueueCtx = React.createContext<TxState>({} as TxState);
let queueId = 1;

export function TxQueueCtxRoot({ children }: Props): React.ReactElement<Props> {
  const [queue, setQueue] = useState<TxQueueState[]>([]);

  const addQueue = useCallback((value: TxQueue) => {
    setQueue((_queue) => {
      const id = value.id || queueId++;

      const newValue = {
        ...value,
        id,
        accounts: value.accounts || {},
        isCancelled: value.isCancelled ?? false,
        isApprove: value.isApprove ?? false,
        transaction: value.transaction,
        destSender: value.destSender || value.accountId,
        destCall: value.destCall || value.extrinsic.method,
        onlySign: value.onlySign || false,
        onSignature: value.onSignature || (() => {}),
        onReject: value.onReject || (() => {}),
        beforeSend: async () => value.beforeSend?.(),
        onError: () => {},
        onRemove: () => {
          value.onRemove?.();
          setQueue((_queue) => _queue.filter((item) => item.id !== id));
        }
      };

      return [..._queue, newValue];
    });
  }, []);

  return <TxQueueCtx.Provider value={{ queue, addQueue }}>{children}</TxQueueCtx.Provider>;
}
