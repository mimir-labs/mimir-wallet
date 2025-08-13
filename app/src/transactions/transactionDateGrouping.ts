// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Transaction } from '@/hooks/types';

import moment from 'moment';

export interface GroupedTransactions {
  date: string;
  label: string;
  transactions: Transaction[];
}

/**
 * Groups transactions by date with labels: Today, Yesterday, or specific date
 * @param transactions - Array of transactions to group
 * @returns Array of grouped transactions
 */
export function groupTransactionsByDate(transactions: Transaction[]): GroupedTransactions[] {
  if (!transactions || transactions.length === 0) {
    return [];
  }

  const today = moment().startOf('day');
  const yesterday = moment().subtract(1, 'day').startOf('day');

  // Group transactions by date
  const grouped = new Map<string, Transaction[]>();

  transactions.forEach((transaction) => {
    // Use createdAt for pending transactions, updatedAt for completed ones
    const timestamp = transaction.status < 2 ? transaction.createdAt : transaction.updatedAt;
    const date = moment(timestamp).startOf('day');
    const dateKey = date.format('YYYY-MM-DD');

    if (!grouped.has(dateKey)) {
      grouped.set(dateKey, []);
    }

    grouped.get(dateKey)!.push(transaction);
  });

  // Convert to array and add labels
  const result: GroupedTransactions[] = [];

  Array.from(grouped.entries())
    .sort(([a], [b]) => b.localeCompare(a)) // Sort dates descending
    .forEach(([dateKey, txs]) => {
      const date = moment(dateKey);
      let label: string;

      if (date.isSame(today, 'day')) {
        label = 'Today';
      } else if (date.isSame(yesterday, 'day')) {
        label = 'Yesterday';
      } else {
        // Format as "December 18, 2024" or similar based on locale
        label = date.format('MMMM D, YYYY');
      }

      result.push({
        date: dateKey,
        label,
        transactions: txs
      });
    });

  return result;
}

/**
 * Merges new transactions into existing groups (for infinite scroll)
 * @param existingGroups - Current grouped transactions
 * @param newTransactions - New transactions to add
 * @returns Updated grouped transactions
 */
export function mergeTransactionGroups(
  existingGroups: GroupedTransactions[],
  newTransactions: Transaction[]
): GroupedTransactions[] {
  if (!newTransactions || newTransactions.length === 0) {
    return existingGroups;
  }

  // Create a map from existing groups
  const groupMap = new Map<string, GroupedTransactions>();

  existingGroups.forEach((group) => {
    groupMap.set(group.date, group);
  });

  // Group new transactions
  const newGroups = groupTransactionsByDate(newTransactions);

  // Merge new groups into existing ones
  newGroups.forEach((newGroup) => {
    if (groupMap.has(newGroup.date)) {
      // Merge transactions into existing group
      const existingGroup = groupMap.get(newGroup.date)!;

      existingGroup.transactions = [...existingGroup.transactions, ...newGroup.transactions];
    } else {
      // Add new group
      groupMap.set(newGroup.date, newGroup);
    }
  });

  // Convert back to array and sort
  return Array.from(groupMap.values()).sort((a, b) => b.date.localeCompare(a.date));
}
