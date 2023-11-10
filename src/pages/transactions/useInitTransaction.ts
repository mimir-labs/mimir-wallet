// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Transaction } from '@mimirdev/hooks/types';

import { useEffect, useState } from 'react';

import { traverseTransaction } from '@mimirdev/hooks';
import { getAddressMeta } from '@mimirdev/utils';

export function useInitTransaction(value: Transaction) {
  const [transaction, setTransaction] = useState<Transaction>();

  useEffect(() => {
    let _transaction: Transaction | undefined;

    traverseTransaction(value, (transaction) => {
      if (!_transaction) {
        _transaction = transaction;
      }

      if (!transaction.height || !transaction.index) {
        return;
      }

      if (!_transaction.height || !transaction.index) {
        _transaction = transaction;

        return;
      }

      const height = transaction.height;
      const index = transaction.height;
      const _height = _transaction.height;
      const _index = _transaction.height;

      if (height < _height) {
        _transaction = transaction;
      } else if (height === _height) {
        if (index < _index) {
          _transaction = transaction;
        } else if (index === _index) {
          if (getAddressMeta(_transaction.sender).isMultisig) {
            _transaction = transaction;
          }
        }
      }
    });

    setTransaction(_transaction);
  }, [value]);

  return transaction;
}
