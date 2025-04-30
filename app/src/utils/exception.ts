// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

export function assert(condition: unknown, message: string | (() => Error)): asserts condition {
  if (!condition) {
    throw typeof message === 'string' ? new Error(message) : message();
  }
}

export function assertReturn<T>(value: T | undefined | null, message: string | (() => Error)): T {
  assert(value !== undefined && value !== null, message);

  return value;
}

export const asError = (thrown: unknown): Error => {
  if (thrown instanceof Error) {
    return thrown;
  }

  let message: string;

  if (typeof thrown === 'string') {
    message = thrown;
  } else {
    try {
      message = JSON.stringify(thrown);
    } catch {
      message = String(thrown);
    }
  }

  return new Error(message);
};
