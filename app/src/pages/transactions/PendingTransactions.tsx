// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useMultichainPendingTransactions } from '@/hooks/useTransactions';
import { GroupedTransactions } from '@/transactions';
import { groupTransactionsByDate } from '@/transactions/transactionDateGrouping';
import React, { useMemo } from 'react';

import { skeleton } from './skeleton';

function PendingTransactions({
  isFetched,
  isFetching,
  networks,
  address,
  txId
}: {
  isFetched: boolean;
  isFetching: boolean;
  networks: string[];
  address: string;
  txId?: string;
}) {
  const data = useMultichainPendingTransactions(networks, address, txId);

  const groupedTransactions = useMemo(() => {
    const list = data
      .map((item) => item.data)
      .flat()
      .sort((a, b) => b.createdAt - a.createdAt);

    return groupTransactionsByDate(list);
  }, [data]);

  const showSkeleton = (!isFetched && isFetching) || data.some((item) => item.isFetching && !item.isFetched);

  return (
    <div className='space-y-5'>
      <GroupedTransactions groupedTransactions={groupedTransactions} />
      {showSkeleton ? skeleton : null}
    </div>
  );
}

export default React.memo(PendingTransactions);
