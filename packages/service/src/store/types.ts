// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

export type StorageEvent = {
  [key: string]: (...args: any[]) => void;
  store_changed: (key: string, oldValue: unknown, newValue: unknown) => void;
};
