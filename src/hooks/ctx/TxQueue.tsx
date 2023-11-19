// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Filtered, TxQueue } from './types';

import React, { useCallback, useState } from 'react';

interface Props {
  children?: React.ReactNode;
}

export interface TxState {
  queue: (Required<TxQueue> & { filtered?: Filtered })[];
  addQueue: (queue: TxQueue & { filtered?: Filtered }) => void;
}

export const TxQueueCtx = React.createContext<TxState>({} as TxState);
let queueId = 1;

export function TxQueueCtxRoot({ children }: Props): React.ReactElement<Props> {
  const [queue, setQueue] = useState<(Required<TxQueue> & { filtered?: Filtered })[]>([]);

  const addQueue = useCallback((value: TxQueue) => {
    setQueue((_queue) => {
      const id = value.id || queueId++;

      const newValue = {
        ...value,
        id,
        isCancelled: value.isCancelled ?? false,
        beforeSend: async () => value.beforeSend?.(),
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
