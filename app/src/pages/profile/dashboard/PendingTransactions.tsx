// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

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
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { SubApiRoot, useApi } from '@mimir-wallet/polkadot-core';
import { Skeleton, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from '@mimir-wallet/ui';

function CallDetail({ value }: { value?: string | null }) {
  const { api, isApiReady } = useApi();

  const call = useMemo(() => {
    if (!isApiReady) return null;

    try {
      return api.registry.createType('Call', value);
    } catch {
      return null;
    }
  }, [api.registry, isApiReady, value]);

  return <CallDisplayDetail fallbackWithName registry={api.registry} call={call} />;
}

function AnnouncementStatus({ account, transaction }: { account: AccountData; transaction: ProxyTransaction }) {
  const [status, isFetching] = useAnnouncementStatus(transaction, account);

  if (isFetching) {
    return <Skeleton className='h-[20px] w-[60px]' />;
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
    return <Skeleton className='h-[20px] w-[60px]' />;
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
  return <SubApiRoot network={network}>{children}</SubApiRoot>;
}

function PendingTransactions({ address }: { address: string }) {
  const [{ validPendingNetworks }, isFetched, isFetching] = useValidTransactionNetworks(address);
  const data = useMultichainPendingTransactions(
    validPendingNetworks.map((item) => item.network),
    address
  );
  const { setNetwork } = useApi();
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
      <div className='rounded-large shadow-medium bg-content1 flex h-[260px] flex-col gap-5 p-5'>
        <Skeleton className='h-[40px] w-full rounded-lg' />
        <Skeleton className='h-[40px] w-full rounded-lg' />
        <Skeleton className='h-[40px] w-full rounded-lg' />
        <Skeleton className='h-[40px] w-full rounded-lg' />
      </div>
    );
  }

  if (!transactions.length) {
    return (
      <div className='rounded-large shadow-medium bg-content1 flex h-[260px] flex-col items-center justify-center gap-5 p-5'>
        <Empty variant='pending-transaction' height='200px' />
      </div>
    );
  }

  return (
    <Table
      isHeaderSticky
      shadow='md'
      classNames={{
        base: 'py-0 group',
        wrapper:
          'rounded-large p-2 sm:p-3 h-auto sm:h-[260px] py-0 sm:py-0 scroll-hover-show border-1 border-secondary bg-content1',
        thead: '[&>tr]:first:shadow-none bg-content1/70 backdrop-saturate-150 backdrop-blur-sm',
        th: 'bg-transparent text-tiny h-auto pt-5 pb-2 px-2 text-foreground/50 first:rounded-none last:rounded-none',
        td: 'text-small px-2',
        loadingWrapper: 'relative h-10 table-cell px-2'
      }}
    >
      <TableHeader>
        <TableColumn className='w-[140px]' key='id'>
          Transaction ID
        </TableColumn>
        <TableColumn className='w-[240px]' key='call'>
          Call
        </TableColumn>
        <TableColumn className='w-[180px]' align='end' key='status'>
          Status
        </TableColumn>
      </TableHeader>

      <TableBody items={transactions}>
        {(item) => {
          return (
            <TableRow
              key={item.id}
              className='[&:hover>td]:bg-secondary border-secondary [&>td]:first:rounded-l-medium [&>td]:last:rounded-r-medium cursor-pointer border-b-1 [&:hover_.operation]:flex [&:hover_.status]:hidden [&>td]:h-[45px]'
              onClick={() => {
                setNetwork(item.network);
                navigate(`/transactions/${item.id}?network=${item.network}&address=${address}`);
              }}
            >
              <TableCell>
                <div className='flex items-center gap-[5px] text-nowrap'>
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
              <TableCell className='w-[180px]'>
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
          );
        }}
      </TableBody>
    </Table>
  );
}

export default React.memo(PendingTransactions);
