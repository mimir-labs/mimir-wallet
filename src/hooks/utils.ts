// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Transaction } from './types';

export function traverseTransaction(transaction: Transaction, callback: (transaction: Transaction) => void) {
  callback(transaction);

  for (const child of transaction.children) {
    traverseTransaction(child, callback);
  }
}
