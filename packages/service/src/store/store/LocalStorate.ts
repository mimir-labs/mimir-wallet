// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { StorageEvent } from '../types.js';

import { EventEmitter } from 'eventemitter3';

import { deserialize, getAllItems, serialize } from './utils.js';

export class LocalStorage extends EventEmitter<StorageEvent> {
  #items: Map<string, unknown> = new Map();

  constructor() {
    super();

    this.#items = getAllItems(localStorage);
    window.addEventListener('storage', (event) => {
      if (event.storageArea === localStorage) {
        if (localStorage.length === 0) {
          // clear storage

          for (const [key, value] of this.#items) {
            this.#items.delete(key);
            this.emit('store_changed', key, value, null);
          }
        } else if (event.key) {
          const oldValue = deserialize(event.oldValue);
          const newValue = deserialize(event.newValue);

          this.#items.set(event.key, newValue);
          this.emit('store_changed', event.key, oldValue, newValue);
        }
      }
    });
  }

  public get(key: string | null): unknown {
    if (!key) return undefined;

    const val = localStorage.getItem(key);

    return deserialize(val);
  }

  public set(key: string, value: unknown) {
    localStorage.setItem(key, serialize(value));
    const oldValue = this.#items.get(key);

    this.#items.set(key, value);
    this.emit('store_changed', key, oldValue, value);
  }

  public remove(key: string) {
    localStorage.removeItem(key);
    const oldValue = this.#items.get(key);

    this.#items.delete(key);
    this.emit('store_changed', key, oldValue, null);
  }

  public each(fn: (key: string, val: unknown) => void): void {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);

      if (key) fn(key, this.get(key));
    }
  }
}
