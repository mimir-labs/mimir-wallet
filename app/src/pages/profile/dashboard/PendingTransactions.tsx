// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { NetworkProvider, useNetwork } from '@mimir-wallet/polkadot-core';
import { Skeleton, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from '@mimir-wallet/ui';
import { useNavigate } from '@tanstack/react-router';
import React, { useMemo } from 'react';

import { useAddressMeta } from '@/accounts/useAddressMeta';
import { useQueryAccount } from '@/accounts/useQueryAccount';
import { AppName, Empty } from '@/components';
import {
  type AccountData,
  type ProxyTransaction,
  type Transaction,
  TransactionStatus,
  TransactionType
} from '@/hooks/types';
import { useFilterPaths } from '@/hooks/useFilterPaths';
import { useParseCall } from '@/hooks/useParseCall';
import { useMultichainPendingTransactions, useValidTransactionNetworks } from '@/hooks/useTransactions';
import { CallDisplayDetail } from '@/params';
import {
  ApproveButton,
  CancelButton,
  ExecuteAnnounceButton,
  formatTransactionId,
  RemoveOrDenyButton
} from '@/transactions';
import { useAnnouncementStatus } from '@/transactions/hooks/useAnnouncementStatus';

function CallDetail({ value }: { value?: string | null }) {
  const { network } = useNetwork();

  const { call, isLoading } = useParseCall(network, value);

  if (isLoading || !call) return null;

  return <CallDisplayDetail fallbackWithName registry={call.registry} call={call} />;
}

function AnnouncementStatus({ account, transaction }: { account: AccountData; transaction: ProxyTransaction }) {
  const [status, isFetching] = useAnnouncementStatus(transaction, account);

  if (isFetching) {
    return <Skeleton className='ml-auto h-[20px] w-[60px]' />;
  }

  if (status === 'indexing') return 'Indexing';
  if (status === 'reviewing') return 'Reviewing';
  if (status === 'executable') return 'Executable';

  return null;
}

function MultisigStatus({ transaction }: { transaction: Transaction }) {
  const { meta } = useAddressMeta(transaction.address);
  const approvals = useMemo(() => {
    return transaction.children.filter((item) => item.status === TransactionStatus.Success).length;
  }, [transaction.children]);

  return `${approvals}/${meta.threshold}`;
}

function Status({ transaction, address }: { transaction: Transaction; address: string }) {
  const [account] = useQueryAccount(address);

  if (!account) {
    return <Skeleton className='ml-auto h-[20px] w-[60px]' />;
  }

  if (transaction.type === TransactionType.Announce) {
    return <AnnouncementStatus account={account} transaction={transaction} />;
  }

  if (transaction.type === TransactionType.Multisig) {
    return <MultisigStatus transaction={transaction} />;
  }

  return 'Pending';
}

function Operation({ transaction, address }: { transaction: Transaction; address: string }) {
  const [account] = useQueryAccount(address);
  const filterPaths = useFilterPaths(account, transaction);

  return (
    <>
      {account ? <ApproveButton isIcon filterPaths={filterPaths} account={account} transaction={transaction} /> : null}
      {account ? <ExecuteAnnounceButton isIcon account={account} transaction={transaction} /> : null}
      <CancelButton isIcon transaction={transaction} />
      <RemoveOrDenyButton isIcon transaction={transaction} />
    </>
  );
}

function NetworkWrapper({ network, children }: { network: string; children: React.ReactNode }) {
  return <NetworkProvider network={network}>{children}</NetworkProvider>;
}

function PendingTransactions({ address }: { address: string }) {
  const [{ validPendingNetworks }, isFetched, isFetching] = useValidTransactionNetworks(address);
  const data = useMultichainPendingTransactions(
    validPendingNetworks.map((item) => item.network),
    address
  );

  const navigate = useNavigate();

  const transactions = useMemo(() => {
    return data
      .map((item) => item.data)
      .flat()
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [data]);

  const showSkeleton = (!isFetched && isFetching) || data.some((item) => item.isFetching && !item.isFetched);

  if (showSkeleton) {
    return (
      <div className='bg-background flex h-[260px] flex-col gap-5 rounded-[20px] p-5 shadow-md'>
        <Skeleton className='h-[45px] w-full rounded-lg' />
        <Skeleton className='h-[45px] w-full rounded-lg' />
        <Skeleton className='h-[45px] w-full rounded-lg' />
        <Skeleton className='h-[45px] w-full rounded-lg' />
      </div>
    );
  }

  if (!transactions.length) {
    return (
      <div className='bg-background flex h-[260px] flex-col items-center justify-center gap-5 rounded-[20px] p-5 shadow-md'>
        <Empty variant='pending-transaction' height='200px' />
      </div>
    );
  }

  return (
    <Table
      stickyHeader
      containerClassName='border-secondary bg-background shadow-md rounded-[20px] border'
      scrollClassName='h-auto sm:h-[260px] px-2 sm:px-3'
    >
      <TableHeader>
        <TableRow className='border-0'>
          <TableColumn className='w-[140px] pt-5 pb-2' key='id'>
            Transaction ID
          </TableColumn>
          <TableColumn className='w-[240px] pt-5 pb-2' key='call'>
            Call
          </TableColumn>
          <TableColumn className='w-[180px] pt-5 pb-2 text-right' key='status'>
            Status
          </TableColumn>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((item) => (
          <TableRow
            key={item.id}
            className='[&:hover>td]:bg-secondary cursor-pointer [&:hover_.operation]:flex [&:hover_.status]:hidden [&>td]:h-[45px] [&>td]:first:rounded-l-[10px] [&>td]:last:rounded-r-[10px]'
            onClick={() => {
              navigate({
                to: `/transactions/$id`,
                params: {
                  id: item.id.toString()
                },
                search: {
                  network: item.network,
                  address: address
                }
              });
            }}
          >
            <TableCell>
              <div className='flex min-w-max items-center gap-[5px] text-nowrap'>
                <AppName
                  website={item.website}
                  iconSize={16}
                  hiddenName
                  iconUrl={item.iconUrl}
                  appName={item.appName}
                />
                {item.type === TransactionType.Propose ? (
                  <p>Propose {item.id}</p>
                ) : (
                  <p>No {formatTransactionId(item.id)}</p>
                )}
              </div>
            </TableCell>
            <TableCell>
              <NetworkWrapper network={item.network}>
                <CallDetail value={item.call} />
              </NetworkWrapper>
            </TableCell>
            <TableCell className='text-right'>
              <NetworkWrapper network={item.network}>
                <span className='status'>
                  <Status address={address} transaction={item} />
                </span>
                <div className='operation hidden flex-row-reverse items-center gap-[5px]'>
                  <Operation address={address} transaction={item} />
                </div>
              </NetworkWrapper>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default React.memo(PendingTransactions);
