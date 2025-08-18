// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Transaction } from '@/hooks/types';
import type { GroupedTransactions as GroupedTransactionsType } from './transactionDateGrouping';

import { Empty } from '@/components';
import React from 'react';

import { skeleton } from './skeleton';
import TxCell from './TxCell';

interface GroupedTransactionsProps {
  /**
   * Grouped transactions data
   */
  groupedTransactions: GroupedTransactionsType[];
  /**
   * Height for empty state
   */
  emptyHeight?: number | string;
  /**
   * Label for empty state
   */
  emptyLabel?: string;
  /**
   * Whether to open the first transaction by default
   */
  defaultOpenFirst?: boolean;
  /**
   * Custom render function for transaction groups
   */
  renderGroup?: (
    group: GroupedTransactionsType,
    groupIndex: number,
    transactions: React.ReactNode[]
  ) => React.ReactNode;
  /**
   * Custom render function for individual transactions
   */
  renderTransaction?: (transaction: Transaction, index: number, groupIndex: number) => React.ReactNode;
  /**
   * Additional className for the container
   */
  className?: string;
  /**
   * Spacing between groups
   */
  spacing?: 'sm' | 'md' | 'lg';
  /**
   * Group card style variant
   */
  variant?: 'default' | 'compact';
  showSkeleton?: boolean;
}

const spacingClasses = {
  sm: 'space-y-3',
  md: 'space-y-5',
  lg: 'space-y-8'
};

const variantClasses = {
  default: 'p-5',
  compact: 'p-4'
};

function GroupedTransactions({
  groupedTransactions,
  emptyHeight = '80dvh',
  emptyLabel,
  defaultOpenFirst = true,
  renderGroup,
  renderTransaction,
  className = '',
  spacing = 'md',
  variant = 'default',
  showSkeleton
}: GroupedTransactionsProps) {
  // Show empty state if no transactions and showEmpty is enabled
  if (!showSkeleton && groupedTransactions.length === 0) {
    return <Empty height={emptyHeight} label={emptyLabel} />;
  }

  // Default transaction renderer
  const defaultRenderTransaction = (transaction: Transaction, index: number, groupIndex: number) => (
    <TxCell
      key={`${groupedTransactions[groupIndex].label}-${transaction.id}`}
      address={transaction.address}
      transaction={transaction}
      defaultOpen={defaultOpenFirst && groupIndex === 0 && index === 0}
    />
  );

  // Default group renderer
  const defaultRenderGroup = (group: GroupedTransactionsType, _groupIndex: number, transactions: React.ReactNode[]) => (
    <div
      key={group.date}
      className={`bg-background shadow-small border-secondary flex flex-col gap-3 rounded-[20px] border-1 ${variantClasses[variant]}`}
    >
      <h6 className='text-primary'>{group.label}</h6>
      <div className='space-y-3'>{transactions}</div>
    </div>
  );

  const transactionRenderer = renderTransaction || defaultRenderTransaction;
  const groupRenderer = renderGroup || defaultRenderGroup;

  return (
    <div className={`${spacingClasses[spacing]} ${className}`}>
      {groupedTransactions.map((group, groupIndex) => {
        const transactions = group.transactions.map((transaction, index) =>
          transactionRenderer(transaction, index, groupIndex)
        );

        return groupRenderer(group, groupIndex, transactions);
      })}
      {showSkeleton ? skeleton : null}
    </div>
  );
}

export default React.memo(GroupedTransactions);
