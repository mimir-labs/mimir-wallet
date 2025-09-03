// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { useHistoryTransactions } from '@/hooks/useTransactions';
import { GroupedTransactions } from '@/transactions';
import { groupTransactionsByDate } from '@/transactions/transactionDateGrouping';
import React, { useMemo } from 'react';

const limit = 20;

function HistoryTransactions({
  isFetched: propsIsFetched,
  isFetching: propsIsFetching,
  network,
  address,
  txId
}: {
  isFetched: boolean;
  isFetching: boolean;
  network?: string;
  address: string;
  txId?: string;
}) {
  const [data, isFetched, isFetching, hasNexPage, , fetchNextPage] = useHistoryTransactions(
    network,
    address,
    limit,
    txId
  );

  const groupedTransactions = useMemo(() => {
    return groupTransactionsByDate(data);
  }, [data]);

  const sentinelRef = useInfiniteScroll({
    onLoadMore: fetchNextPage,
    hasMore: hasNexPage,
    loading: isFetching
  });

  return (
    <div className='flex flex-col gap-5'>
      <GroupedTransactions
        showSkeleton={(!isFetched && isFetching) || (!propsIsFetched && propsIsFetching) || (isFetching && hasNexPage)}
        groupedTransactions={groupedTransactions}
        defaultOpenFirst={false}
        spacing='md'
      />

      {/* End message */}
      {!hasNexPage && data.length > 0 && <h6 className='text-foreground/50 text-center text-sm'>no data more.</h6>}

      {/* Intersection Observer sentinel */}
      {isFetching ? null : <div ref={sentinelRef} className='h-1' />}
    </div>
  );
}

export default React.memo(HistoryTransactions);
