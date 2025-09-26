// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useAddressMeta } from '@/accounts/useAddressMeta';
import { Empty } from '@/components';
import { type Transaction, TransactionStatus } from '@/hooks/types';
import { useMultichainPendingTransactions, useValidTransactionNetworks } from '@/hooks/useTransactions';
import { formatAgo } from '@/utils';
import moment from 'moment';
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { getChainIcon, useApi } from '@mimir-wallet/polkadot-core';
import { Avatar, Button, Skeleton, Tooltip } from '@mimir-wallet/ui';

// Component props interface
interface ViewPendingTransactionsProps {
  address: string;
  className?: string;
}

// Component for displaying network icon
function NetworkIcon({ network }: { network: string }) {
  const chainInfo = useMemo(() => getChainIcon(network), [network]);

  if (!chainInfo?.icon) {
    return null;
  }

  return (
    <Avatar
      src={chainInfo.icon}
      style={{ width: 30, height: 30, backgroundColor: 'transparent' }}
      className='flex-shrink-0'
    />
  );
}

// Transaction item component matching Figma design exactly
function TransactionItem({ transaction, address }: { transaction: Transaction; address: string }) {
  const { setNetwork } = useApi();
  const navigate = useNavigate();
  const now = Date.now();
  const time = transaction.createdAt;
  const { meta } = useAddressMeta(transaction.address);
  const approvals = useMemo(() => {
    return transaction.children.filter((item) => item.status === TransactionStatus.Success).length;
  }, [transaction.children]);

  const handleViewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setNetwork(transaction.network);
    navigate(`/transactions/${transaction.id}?network=${transaction.network}&address=${address}`);
  };

  return (
    <div className='border-divider-300 flex items-center gap-2.5 rounded-[10px] border p-2.5'>
      <NetworkIcon network={transaction.network} />

      <div className='min-w-0 flex-1 gap-[5px]'>
        <div className='text-sm leading-tight font-bold'>
          {transaction.section}.{transaction.method}
        </div>

        <div className='text-foreground/50 flex items-center gap-1 text-xs leading-tight'>
          <Tooltip content={moment(time).format()}>
            <span>{now - Number(time) < 1000 ? 'Now' : `${formatAgo(Number(time))} ago`}</span>
          </Tooltip>
          <span>
            {approvals}/{meta.threshold} Approved
          </span>
        </div>
      </div>

      <Button size='sm' variant='ghost' radius='full' onClick={handleViewClick}>
        View
      </Button>
    </div>
  );
}

// Main component
function ViewPendingTransactions({ address, className }: ViewPendingTransactionsProps) {
  const [{ validPendingNetworks }, isFetched, isFetching] = useValidTransactionNetworks(address);
  const data = useMultichainPendingTransactions(
    validPendingNetworks.map((item) => item.network),
    address
  );
  const navigate = useNavigate();

  // Get recent 3 transactions sorted by creation time
  const recentTransactions = useMemo(() => {
    return data
      .map((item) => item.data)
      .flat()
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 3); // Limit to 3 most recent transactions
  }, [data]);

  const showSkeleton = (!isFetched && isFetching) || data.some((item) => item.isFetching && !item.isFetched);

  const handleViewAllClick = () => {
    navigate(`/transactions?tab=pending&address=${address}`);
  };

  // Loading state
  if (showSkeleton) {
    return (
      <div className={`rounded-[10px] bg-white p-4 ${className || ''}`}>
        <div className='mb-4'>
          <Skeleton className='h-5 w-64' />
        </div>
        <div className='space-y-3'>
          <Skeleton className='h-16 w-full rounded-[10px]' />
          <Skeleton className='h-16 w-full rounded-[10px]' />
          <Skeleton className='h-16 w-full rounded-[10px]' />
        </div>
        <div className='mt-4 flex justify-center'>
          <Skeleton className='h-8 w-20' />
        </div>
      </div>
    );
  }

  // Empty state
  if (!recentTransactions.length) {
    return (
      <div className={`rounded-[10px] bg-white p-4 ${className || ''}`}>
        <div className='mb-4'>
          <h3 className='text-sm font-normal text-black'>Most Recent Pending Transactions</h3>
        </div>
        <div className='flex min-h-[200px] items-center justify-center'>
          <Empty variant='pending-transaction' height='100px' />
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-[5px] ${className || ''}`}>
      {/* Header: 14px black title */}
      <p>Most Recent Pending Transactions</p>

      {/* Transaction List */}
      <div className='space-y-3'>
        {recentTransactions.map((transaction) => (
          <TransactionItem
            key={`${transaction.network}-${transaction.id}`}
            transaction={transaction}
            address={address}
          />
        ))}
      </div>

      {/* View All Button - same style as individual View buttons */}
      <div>
        <Button size='sm' variant='ghost' radius='full' onClick={handleViewAllClick}>
          View All
        </Button>
      </div>
    </div>
  );
}

export default React.memo(ViewPendingTransactions);
