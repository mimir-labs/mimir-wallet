// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Transaction } from '@mimirdev/hooks/types';

import { CalldataStatus } from '@mimirdev/hooks/types';
import { type AddressMeta, getAddressMeta } from '@mimirdev/utils';

export function extraTransaction(meta: AddressMeta, transaction: Transaction): [approvals: number, txs: Transaction[]] {
  let _approvals = 0;
  const _txs: Transaction[] = [];

  (meta.isFlexible ? transaction.children[0]?.children || [] : transaction.children).forEach((item) => {
    if (item.status === CalldataStatus.Success) {
      _approvals += 1;
      _txs.push(item);
    } else if (item.status !== CalldataStatus.Failed) {
      const meta = getAddressMeta(item.sender);

      if (meta.isMultisig && extraTransaction(meta, item)[0] > 0) {
        _txs.push(item);
      }
    }
  });

  return [_approvals, _txs];
}
