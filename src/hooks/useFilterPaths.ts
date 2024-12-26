// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type {
  AccountData,
  DelegateeProp,
  FilterPath,
  FilterPathWithoutId,
  MultisigAccountData,
  Transaction
} from '@mimir-wallet/hooks/types';

import { useMemo } from 'react';

import { TransactionStatus, TransactionType } from '@mimir-wallet/hooks/types';
import { addressEq } from '@mimir-wallet/utils';
import { accountSource } from '@mimir-wallet/wallet/useWallet';

export function filterPathId(deep: number, filterPath: FilterPathWithoutId) {
  if (filterPath.type === 'proxy') {
    return `${filterPath.type}:${filterPath.address}.${filterPath.proxyType}.${filterPath.real}.${filterPath.delay || 0}`;
  }

  if (filterPath.type === 'multisig') {
    return `${filterPath.type}:${filterPath.address}.${filterPath.threshold}.${filterPath.multisig}.${filterPath.otherSignatures.join('_')}`;
  }

  return `${filterPath.type}:${filterPath.address}`;
}

function findFilterPaths(
  topAccount: AccountData,
  accountSource: (address: string) => string | undefined,
  topTransaction?: Transaction | null
): Array<FilterPath[]> {
  const paths: Array<FilterPath[]> = [];

  type NodeInfo =
    | {
        from: 'delegate';
        parent: AccountData;
        value: AccountData & DelegateeProp;
        approvalForThisPath: boolean;
      }
    | {
        from: 'member';
        parent: MultisigAccountData;
        value: AccountData;
        approvalForThisPath: boolean;
      }
    | {
        from: 'origin';
        parent: null;
        value: AccountData;
        approvalForThisPath: boolean;
      };

  function dfs(deep: number, node: NodeInfo, path: FilterPath[], transaction?: Transaction | null) {
    if (node.from === 'delegate') {
      const p: FilterPathWithoutId = {
        type: 'proxy',
        real: node.parent.address,
        proxyType: node.value.proxyType,
        delay: node.value.proxyDelay,
        address: node.value.address
      } as FilterPath;

      path.push({
        id: filterPathId(deep, p),
        ...p
      });
    } else if (node.from === 'member') {
      const p: FilterPathWithoutId = {
        type: 'multisig',
        multisig: node.parent.address,
        threshold: node.parent.threshold,
        otherSignatures: node.parent.members
          .filter((item) => !addressEq(item.address, node.value.address))
          .map((item) => item.address),
        address: node.value.address
      };

      path.push({
        id: filterPathId(deep, p),
        ...p
      });
    } else {
      const p: FilterPathWithoutId = {
        type: 'origin',
        address: node.value.address
      };

      path.push({ id: filterPathId(deep, p), ...p });
    }

    const approvalForThisPath: boolean =
      node.approvalForThisPath &&
      (!transaction ||
        (transaction.type === TransactionType.Proxy
          ? transaction.status !== TransactionStatus.Success
          : transaction.status === TransactionStatus.Pending));

    if (transaction && transaction.status === TransactionStatus.Success) {
      path.pop();

      return;
    }

    if (
      (!transaction || transaction.status !== TransactionStatus.Success) &&
      approvalForThisPath &&
      accountSource(node.value.address)
    ) {
      paths.push(path.slice());
    }

    // traverse the members or delegatees of the current account
    for (const child of node.value.delegatees) {
      if (transaction) {
        if (transaction.type === TransactionType.Announce) {
          if (addressEq(transaction.delegate, child.address)) {
            dfs(
              deep + 1,
              { from: 'delegate', parent: node.value, value: child, approvalForThisPath },
              path,
              transaction.children.find(
                (item) =>
                  item.section === 'proxy' &&
                  (item.method === 'proxyAnnounced' || item.method === 'announce') &&
                  addressEq(item.address, child.address)
              )
            );
          }
        }

        if (transaction.type === TransactionType.Proxy) {
          if (addressEq(transaction.delegate, child.address)) {
            dfs(
              deep + 1,
              { from: 'delegate', parent: node.value, value: child, approvalForThisPath },
              path,
              transaction.children.find(
                (item) => item.section === 'proxy' && item.method === 'proxy' && addressEq(item.address, child.address)
              )
            );
          }
        }
      } else {
        dfs(deep + 1, { from: 'delegate', parent: node.value, value: child, approvalForThisPath }, path, null);
      }
    }

    if (node.value.type === 'multisig' && (!transaction || transaction.type === TransactionType.Multisig)) {
      // traverse the member or members of the current account
      for (const child of node.value.members) {
        dfs(
          deep + 1,
          {
            from: 'member',
            parent: node.value,
            value: child,
            approvalForThisPath
          },
          path,
          transaction?.children.find(
            (item) =>
              item.section === 'multisig' &&
              (item.method === 'asMulti' || item.method === 'approveAsMulti' || item.method === 'asMultiThreshold1') &&
              addressEq(item.address, child.address)
          )
        );
      }
    }

    path.pop();
  }

  dfs(
    0,
    {
      from: 'origin',
      parent: null,
      value: topAccount,
      approvalForThisPath:
        !topTransaction ||
        (topTransaction.type === TransactionType.Proxy
          ? topTransaction.status !== TransactionStatus.Success
          : topTransaction.status === TransactionStatus.Pending)
    },
    [],
    topTransaction
  );

  return paths;
}

export function useFilterPaths(account?: AccountData | null, transaction?: Transaction | null) {
  return useMemo(() => {
    if (!account) return [];

    return findFilterPaths(account, accountSource, transaction);
  }, [account, transaction]);
}
