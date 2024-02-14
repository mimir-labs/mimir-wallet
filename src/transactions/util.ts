// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Filtered } from '@mimir-wallet/hooks/ctx/types';
import type { Transaction } from '@mimir-wallet/hooks/types';
import type { AddressMeta } from '@mimir-wallet/utils';

import { CalldataStatus } from '@mimir-wallet/hooks/types';
import { getAddressMeta } from '@mimir-wallet/utils';
import keyring from '@polkadot/ui-keyring';
import { addressEq } from '@polkadot/util-crypto';

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

export function extraFiltered(address: string, filtered: Filtered = {}): Filtered {
  const meta = getAddressMeta(address);

  if (meta.isMultisig) {
    meta.who?.forEach((address) => {
      if (keyring.getAccount(address)) {
        filtered[address] = {};
        extraFiltered(address, filtered[address]);
      }
    });
  }

  return filtered;
}

export function removeSuccessFiltered(transaction: Transaction, filtered: Filtered): void {
  const address = transaction.sender;
  const meta = getAddressMeta(address);

  (meta.isFlexible ? transaction.children[0] : transaction).children.forEach((tx) => {
    const _filtered = filtered[tx.sender];

    if (_filtered) {
      if (tx.status === CalldataStatus.Success) {
        delete filtered[tx.sender];
      }

      removeSuccessFiltered(tx, _filtered);
    }
  });
}

export function removeMultisigDeepFiltered(transaction: Transaction, filtered: Filtered): void {
  const meta = getAddressMeta(transaction.sender);

  transaction = meta.isFlexible ? transaction.children[0] : transaction;

  if (transaction.status === CalldataStatus.Initialized) {
    // remove the address not in children
    Object.keys(filtered).forEach((address) => {
      if (!transaction.children.find((item) => addressEq(item.sender, address))) {
        delete filtered[address];
      }
    });
  }

  transaction.children.forEach((tx) => {
    const _filtered = filtered[tx.sender];

    if (_filtered) {
      removeMultisigDeepFiltered(tx, _filtered);
    }
  });
}

export function removeEmptyMultisigFiltered(filtered: Filtered): void {
  Object.keys(filtered).forEach((address) => {
    const meta = getAddressMeta(address);

    const _filtered = filtered[address];

    if (!_filtered) return;

    if (meta.isMultisig && Object.keys(_filtered).length === 0) {
      delete filtered[address];
    } else {
      removeEmptyMultisigFiltered(_filtered);
    }
  });
}

export function checkFiltered(filtered: Filtered): boolean {
  const addresses = Object.keys(filtered);
  let canApprove = false;

  for (const address of addresses) {
    const meta = getAddressMeta(address);

    if (meta.isMultisig) {
      const _filtered = filtered[address];

      if (_filtered) {
        canApprove = checkFiltered(_filtered);
      }
    } else {
      if (keyring.getAccount(address)) {
        canApprove = true;
      }
    }

    if (canApprove) {
      break;
    }
  }

  return canApprove;
}
