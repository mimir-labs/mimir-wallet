// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Spinner } from '@mimir-wallet/ui';
import React, { useMemo } from 'react';

import { useSimpleHistory } from '@/hooks/useTransactions';
import SimpleTxCell from '@/transactions/SimpleTxCell';
import { groupSubscanExtrinsicsByDate } from '@/transactions/transactionDateGrouping';

function AllHistoryTransactions({
  isFetched: propsIsFetched,
  isFetching: propsIsFetching,
  network,
  address
}: {
  isFetched: boolean;
  isFetching: boolean;
  network?: string;
  address: string;
}) {
  const [data, isFetched, isFetching] = useSimpleHistory(network, address, 100);

  const groupedExtrinsics = useMemo(() => {
    return groupSubscanExtrinsicsByDate(data);
  }, [data]);

  const isLoading = (!isFetched && isFetching) || (!propsIsFetched && propsIsFetching);

  if (isLoading) {
    return (
      <div className='flex min-h-[200px] items-center justify-center'>
        <Spinner size='lg' />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className='flex min-h-[200px] items-center justify-center'>
        <p className='text-foreground/50'>No transactions found</p>
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-5'>
      {groupedExtrinsics.map((group) => (
        <div
          key={group.date}
          className='bg-background shadow-small border-secondary flex flex-col gap-3 rounded-[20px] border-1 p-5'
        >
          <h6 className='text-primary'>{group.label}</h6>
          <div className='space-y-3'>
            {group.transactions.map((transaction) => (
              <SimpleTxCell key={transaction.id} transaction={transaction} network={network || ''} />
            ))}
          </div>
        </div>
      ))}

      {/* End message */}
      {data.length > 0 && (
        <h6 className='text-foreground/50 text-center text-sm'>
          Showing {data.length} transaction{data.length !== 1 ? 's' : ''}
        </h6>
      )}
    </div>
  );
}

export default React.memo(AllHistoryTransactions);
