// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { SessionStorage } from './store/SessionStorage.js';
import { BaseStore } from './BaseStore.js';

export class SessionStore extends BaseStore {
  #session: SessionStorage;

  constructor() {
    super();
    this.#session = new SessionStorage();
    this.#session.on('store_changed', (...args) => this.emit('store_changed', ...args));
  }

  public all(): [string, unknown][] {
    const values: [string, unknown][] = [];

    this.each((key, value) => values.push([key, value]));

    return values;
  }

  public each(fn: (key: string, value: unknown) => void): void {
    this.#session.each((key: string, value: unknown): void => {
      fn(key, value);
    });
  }

  public get(key: string): unknown {
    return this.#session.get(key);
  }

  public remove(key: string): void {
    this.#session.remove(key);
  }

  public set(key: string, value: unknown): void {
    this.#session.set(key, value);
  }
}
