// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useMultichainPendingTransactions } from '@/hooks/useTransactions';
import { GroupedTransactions } from '@/transactions';
import { groupTransactionsByDate } from '@/transactions/transactionDateGrouping';
import React, { useEffect, useMemo } from 'react';

function PendingTransactions({
  showDiscarded = false,
  isFetched,
  isFetching,
  networks,
  address,
  txId,
  onDiscardedCountsChange
}: {
  showDiscarded?: boolean;
  isFetched: boolean;
  isFetching: boolean;
  networks: string[];
  address: string;
  txId?: string;
  onDiscardedCountsChange?: (counts: number) => void;
}) {
  const data = useMultichainPendingTransactions(networks, address, txId);

  const groupedTransactions = useMemo(() => {
    const list = data
      .map((item) => item.data)
      .flat()
      .sort((a, b) => b.createdAt - a.createdAt);

    return showDiscarded
      ? groupTransactionsByDate(list.filter((item) => !!item.isDiscarded))
      : groupTransactionsByDate(list.filter((item) => !item.isDiscarded));
  }, [data, showDiscarded]);

  const discardedCounts = useMemo(() => {
    return data
      .map((item) => item.data)
      .flat()
      .filter((item) => !!item.isDiscarded).length;
  }, [data]);

  useEffect(() => {
    onDiscardedCountsChange?.(discardedCounts);
  }, [discardedCounts, onDiscardedCountsChange]);

  const showSkeleton = (!isFetched && isFetching) || data.some((item) => item.isFetching && !item.isFetched);

  return (
    <div className='space-y-5'>
      <GroupedTransactions showSkeleton={showSkeleton} groupedTransactions={groupedTransactions} />
    </div>
  );
}

export default React.memo(PendingTransactions);
