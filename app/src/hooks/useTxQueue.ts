// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { TxEvents } from '@/api';
import type { SubmittableExtrinsic } from '@polkadot/api/types';
import type { AccountId, Address } from '@polkadot/types/interfaces';
import type { ExtrinsicPayloadValue, IMethod, ISubmittableResult } from '@polkadot/types/types';
import type { HexString } from '@polkadot/util/types';
import type { FilterPath, Transaction } from '../hooks/types';

import { GenericExtrinsic } from '@polkadot/types';
import { create } from 'zustand';

export interface TxQueue {
  id?: number;
  accountId?: AccountId | Address | string;
  call: IMethod;
  filterPaths?: FilterPath[];
  transaction?: Transaction;
  onlySign?: boolean;
  website?: string;
  iconUrl?: string;
  appName?: string;
  relatedBatches?: number[];
  onReject?: () => void;
  onClose?: () => void;
  onError?: (error: unknown) => void;
  onResults?: (results: ISubmittableResult) => void;
  onFinalized?: (results: ISubmittableResult) => void;
  onSignature?: (
    signer: string,
    signature: HexString,
    signedTransaction: HexString,
    payload: ExtrinsicPayloadValue
  ) => void;
  beforeSend?: (extrinsic: SubmittableExtrinsic<'promise'>) => Promise<void>;
}

export interface TxState {
  queue: TxQueue[];
  toasts: TxToastState[];
  addQueue: (queue: TxQueue) => void;
}

export interface TxToast {
  id?: number;
  onRemove?: () => void;
  events: TxEvents;
}

export type TxToastState = Omit<Required<TxToast>, 'onChange'> & { onChange?: () => void };

let queueId = 1;
let toastId = 1;

export const useTxQueue = create<TxState>()((set) => ({
  queue: [],
  toasts: [],
  addQueue: (value: TxQueue) => {
    const id = value.id || queueId++;
    const newValue: TxQueue = {
      ...value,
      id,
      call: value.call instanceof GenericExtrinsic ? value.call.method : value.call,
      onResults: (result) => {
        value.onResults?.(result);
        set((state) => ({ queue: state.queue.filter((item) => item.id !== id) }));
      },
      onSignature: (...args) => {
        value.onSignature?.(...args);
        set((state) => ({ queue: state.queue.filter((item) => item.id !== id) }));
      },
      onClose: () => {
        value.onClose?.();
        set((state) => ({ queue: state.queue.filter((item) => item.id !== id) }));
      }
    };

    set((state) => {
      return { queue: [...state.queue, newValue] };
    });
  }
}));

export function addTxToast(toast: TxToast) {
  const _id = ++toastId;

  const onRemove = () => {
    useTxQueue.setState((state) => ({ toasts: state.toasts.filter((item) => item.id !== _id) }));
  };

  useTxQueue.setState((state) => ({
    toasts: [...state.toasts, { id: _id, events: toast.events, onRemove }]
  }));
}
