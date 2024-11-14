// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ISubmittableResult } from '@polkadot/types/types';
import type { U8aLike } from '@polkadot/util/types';

import EventEmitter from 'eventemitter3';

type EventTypes = {
  signed: (signature: U8aLike) => void;
  inblock: (result: ISubmittableResult) => void;
  completed: (result: ISubmittableResult) => void;
  finalized: (result: ISubmittableResult) => void;
  error: (error: unknown) => void;
  success: (message?: string) => void;
};

export class TxEvents extends EventEmitter<EventTypes> {
  public status: keyof EventTypes | 'pending' = 'pending';

  public signature?: U8aLike;

  public result?: ISubmittableResult;

  public error?: unknown;

  public message?: string;

  constructor() {
    super();

    this.once('signed', (signature: U8aLike) => {
      this.status = 'signed';
      this.signature = signature;
    });
    this.once('inblock', (result: ISubmittableResult) => {
      this.status = 'inblock';
      this.result = result;
    });
    this.once('completed', (result: ISubmittableResult) => {
      this.status = 'completed';
      this.result = result;
    });
    this.once('finalized', (result: ISubmittableResult) => {
      this.status = 'finalized';
      this.result = result;
    });
    this.once('error', (error: unknown) => {
      this.status = 'error';
      this.error = error;
    });
    this.once('success', (message?: string) => {
      this.status = 'success';
      this.message = message;
    });
  }

  public override removeAllListeners(): this {
    super.removeAllListeners();

    return this;
  }
}
