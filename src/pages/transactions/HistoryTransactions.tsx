// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountData } from '@mimir-wallet/hooks/types';

import { Box, Typography } from '@mui/material';
import React from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';

import { Empty } from '@mimir-wallet/components';
import { useHistoryTransactions } from '@mimir-wallet/hooks';
import { TxCell } from '@mimir-wallet/transactions';

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
      endMessage={
        <Typography variant='h6' fontSize='0.875rem' textAlign='center' color='textSecondary'>
          no data more.
        </Typography>
      }
    >
      {data.map((item) => (
        <Box key={item.id} sx={{ marginBottom: 2 }}>
          <TxCell key={item.id} account={account} transaction={item} />
        </Box>
      ))}
    </InfiniteScroll>
  );
}

export default React.memo(HistoryTransactions);
