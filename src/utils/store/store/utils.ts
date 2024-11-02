// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

export function serialize(obj: unknown) {
  return JSON.stringify(obj);
}

export function deserialize(strVal: string | null) {
  if (!strVal) return undefined;

  let val: unknown;

  try {
    val = JSON.parse(strVal);
  } catch (e) {
    val = strVal;
  }

  return val;
}

export function getAllItems(storage: Storage): Map<string, unknown> {
  const items: Map<string, unknown> = new Map();

  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i);

    if (key) {
      items.set(key, deserialize(storage.getItem(key)));
    }
  }

  return items;
}
