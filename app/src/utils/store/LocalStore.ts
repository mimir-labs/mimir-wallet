// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { LocalStorage } from './store/LocalStorate';
import { BaseStore } from './BaseStore';

export class LocalStore extends BaseStore {
  #store: LocalStorage;

  constructor() {
    super();
    this.#store = new LocalStorage();
    this.#store.on('store_changed', (...args) => this.emit('store_changed', ...args));
  }

  public all(): [string, unknown][] {
    const values: [string, unknown][] = [];

    this.each((key, value) => values.push([key, value]));

    return values;
  }

  public each(fn: (key: string, value: unknown) => void): void {
    this.#store.each((key: string, value: unknown): void => {
      fn(key, value);
    });
  }

  public get(key: string): unknown {
    return this.#store.get(key);
  }

  public remove(key: string): void {
    this.#store.remove(key);
  }

  public set(key: string, value: unknown): void {
    this.#store.set(key, value);
  }
}
