// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountData } from '@/hooks/types';

import { Empty } from '@/components';
import { useHistoryTransactions } from '@/hooks/useTransactions';
import { TxCell } from '@/transactions';
import React from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';

import { skeleton } from './skeleton';

const limit = 20;

function HistoryTransactions({ account, txId }: { account: AccountData; txId?: string }) {
  const [data, isFetched, isFetching, hasNexPage, , fetchNextPage] = useHistoryTransactions(
    account.address,
    limit,
    txId
  );

  if (isFetched && data && data.length === 0) {
    return <Empty height='80dvh' />;
  }

  if (!isFetched && isFetching) {
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
          <TxCell key={item.id} account={account} transaction={item} />
        </div>
      ))}
    </InfiniteScroll>
  );
}

export default React.memo(HistoryTransactions);
