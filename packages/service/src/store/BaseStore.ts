// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { StorageEvent } from './types.js';

import { EventEmitter } from 'eventemitter3';

export abstract class BaseStore extends EventEmitter<StorageEvent> {
  public abstract each(fn: (key: string, value: unknown) => void): void;
  public abstract all(): [string, unknown][];
  public abstract get(key: string): unknown;
  public abstract set(key: string, value: unknown): void;
  public abstract remove(key: string): void;
}
