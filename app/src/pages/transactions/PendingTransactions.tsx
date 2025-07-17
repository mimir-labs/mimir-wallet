// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Empty } from '@/components';
import { useMultichainPendingTransactions } from '@/hooks/useTransactions';
import { TxCell } from '@/transactions';
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

  const transactions = useMemo(() => {
    const list = data
      .map((item) => item.data)
      .flat()
      .sort((a, b) => b.createdAt - a.createdAt);

    return list;
  }, [data]);

  const showSkeleton = (!isFetched && isFetching) || data.some((item) => item.isFetching && !item.isFetched);

  if (!showSkeleton && transactions.length === 0) {
    return <Empty height='80dvh' />;
  }

  return (
    <div className='space-y-5'>
      {transactions.map((transaction, index) => (
        <TxCell defaultOpen={index === 0} key={transaction.id} address={address} transaction={transaction} />
      ))}
      {showSkeleton ? skeleton : null}
    </div>
  );
}

export default React.memo(PendingTransactions);
