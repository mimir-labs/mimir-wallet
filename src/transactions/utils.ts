// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountData, Transaction } from '@mimir-wallet/hooks/types';

import { TransactionStatus, TransactionType } from '@mimir-wallet/hooks/types';
import { addressEq } from '@mimir-wallet/utils';

export function approvalCounts(account: AccountData, transaction: Transaction): [counts: number, threshold: number] {
  if (account.type !== 'multisig') {
    if (account.type === 'pure' && account.delegatees.length === 1 && account.delegatees[0].type === 'multisig') {
      const multisigAccount = account.delegatees[0];
      const multisigTransaction = transaction.children.find(
        (item) => item.type === TransactionType.Multisig && addressEq(item.address, multisigAccount.address)
      );

      if (multisigTransaction) {
        return approvalCounts(multisigAccount, multisigTransaction);
      }

      return [0, multisigAccount.threshold];
    }

    return [transaction.status === TransactionStatus.Success ? 1 : 0, 1];
  }

  if (transaction.type !== TransactionType.Multisig) {
    return [1, 1];
  }

  let approveCount = 0;

  for (const item of transaction.children) {
    if (item.status === TransactionStatus.Success) {
      approveCount++;
    }
  }

  return [approveCount, account.threshold];
}
