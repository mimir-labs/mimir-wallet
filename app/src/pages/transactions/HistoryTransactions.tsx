// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Empty } from '@/components';
import { useHistoryTransactions } from '@/hooks/useTransactions';
import { TxCell } from '@/transactions';
import React from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';

import { skeleton } from './skeleton';

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

  if (isFetched && data && data.length === 0) {
    return <Empty height='80dvh' />;
  }

  if ((!isFetched && isFetching) || (!propsIsFetched && propsIsFetching)) {
    return skeleton;
  }

  return (
    <InfiniteScroll
      dataLength={data.length}
      next={fetchNextPage}
      hasMore={hasNexPage}
      loader={skeleton}
      endMessage={<h6 className='text-small text-center text-foreground/50'>no data more.</h6>}
    >
      {data.map((item) => (
        <div key={item.id} className='mb-5'>
          <TxCell key={item.id} address={address} transaction={item} />
        </div>
      ))}
    </InfiniteScroll>
  );
}

export default React.memo(HistoryTransactions);
