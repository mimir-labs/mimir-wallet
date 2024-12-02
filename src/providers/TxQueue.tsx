// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { TxQueue } from './types';

import { GenericExtrinsic } from '@polkadot/types';
import React, { useCallback, useMemo, useState } from 'react';

import { TxQueueCtx } from './context';

interface Props {
  children?: React.ReactNode;
}

let queueId = 1;

export function TxQueueCtxRoot({ children }: Props): React.ReactElement<Props> {
  const [queue, setQueue] = useState<TxQueue[]>([]);

  const addQueue = useCallback((value: TxQueue) => {
    setQueue((_queue) => {
      const id = value.id || queueId++;

      const newValue: TxQueue = {
        ...value,
        id,
        call: value.call instanceof GenericExtrinsic ? value.call.method : value.call,
        onResults: (result) => {
          value.onResults?.(result);
          setQueue((_queue) => _queue.filter((item) => item.id !== id));
        },
        onSignature: (...args) => {
          value.onSignature?.(...args);
          setQueue((_queue) => _queue.filter((item) => item.id !== id));
        },
        onClose: () => {
          value.onClose?.();
          setQueue((_queue) => _queue.filter((item) => item.id !== id));
        }
      };

      return [..._queue, newValue];
    });
  }, []);

  const value = useMemo(() => ({ queue, addQueue }), [addQueue, queue]);

  return <TxQueueCtx.Provider value={value}>{children}</TxQueueCtx.Provider>;
}
