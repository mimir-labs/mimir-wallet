// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SubmittableExtrinsic } from '@polkadot/api/types';
import type { AccountId, Address, Extrinsic } from '@polkadot/types/interfaces';
import type { ExtrinsicPayloadValue, IMethod, ISubmittableResult } from '@polkadot/types/types';
import type { HexString } from '@polkadot/util/types';
import type { TxEvents } from '@mimir-wallet/api';
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
  onReject?: () => void;
  onClose?: () => void;
  onError?: (error: unknown) => void;
  onResults?: (results: ISubmittableResult) => void;
  onFinalized?: (results: ISubmittableResult) => void;
  onSignature?: (signer: string, signature: HexString, tx: Extrinsic, payload: ExtrinsicPayloadValue) => void;
  beforeSend?: (extrinsic: SubmittableExtrinsic<'promise'>) => Promise<void>;
}

export interface TxState {
  queue: TxQueue[];
  toasts: TxToastState[];
  addQueue: (queue: TxQueue) => void;
}

export interface TxToast {
  id?: number;
  style?: 'notification' | 'dialog';
  onRemove?: () => void;
  onChange?: () => void;
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
  const style = toast.style || 'notification';

  const onRemove = () => {
    useTxQueue.setState((state) => ({ toasts: state.toasts.filter((item) => item.id !== _id) }));
  };

  const onChange =
    style === 'dialog'
      ? () => {
          useTxQueue.setState((state) => ({
            ...state,
            toasts: state.toasts.map((item) =>
              item.id === _id
                ? {
                    ...item,
                    style: 'notification',
                    onChange: undefined
                  }
                : item
            )
          }));
        }
      : undefined;

  useTxQueue.setState((state) => ({
    toasts: [...state.toasts, { id: _id, events: toast.events, style, onRemove, onChange }]
  }));
}
