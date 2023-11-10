// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SubmittableExtrinsic } from '@polkadot/api/types';
import type { AccountId, Address } from '@polkadot/types/interfaces';

import React, { useCallback, useState } from 'react';

interface Props {
  children?: React.ReactNode;
}

export interface TxQueue {
  id?: number;
  accountId: AccountId | Address | string;
  beforeSend?: () => Promise<void>;
  extrinsic: SubmittableExtrinsic<'promise'>;
  filtered?: Record<string, string[]>;
  onRemove?: () => void;
}

export interface TxState {
  queue: Required<TxQueue>[];
  addQueue: (queue: TxQueue) => void;
}

export const TxQueueCtx = React.createContext<TxState>({} as TxState);
let queueId = 1;

export function TxQueueCtxRoot({ children }: Props): React.ReactElement<Props> {
  const [queue, setQueue] = useState<Required<TxQueue>[]>([]);

  const addQueue = useCallback((value: TxQueue) => {
    setQueue((_queue) => {
      const id = value.id || queueId++;

      const newValue = {
        ...value,
        id,
        beforeSend: async () => value.beforeSend?.(),
        filtered: value.filtered || {},
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
