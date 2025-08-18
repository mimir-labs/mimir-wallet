// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Transaction } from '@/hooks/types';

import { useQueryAccount } from '@/accounts/useQueryAccount';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useQueryParam } from '@/hooks/useQueryParams';
import { useTransactionDetail } from '@/hooks/useTransactions';
import { GroupedTransactions, TxProgress } from '@/transactions';
import { groupTransactionsByDate } from '@/transactions/transactionDateGrouping';
import { useMemo } from 'react';
import { useParams } from 'react-router-dom';

import { SubApiRoot, useApi } from '@mimir-wallet/polkadot-core';
import { Spinner } from '@mimir-wallet/ui';

import Details from './Details';
import Summary from './Summary';

function SmPage({ transaction }: { transaction: Transaction }) {
  const [account] = useQueryAccount(transaction?.address);

  if (!account) {
    return null;
  }

  return (
    <div className='space-y-4'>
      <Summary transaction={transaction} />

      <Details transaction={transaction} />

      <TxProgress account={account} transaction={transaction} className='bg-content1 rounded-[20px]' />
    </div>
  );
}

function PageTransactionDetails() {
  const { network } = useApi();
  const { id } = useParams<{ id: string }>();
  const [transaction, isFetched, isFetching] = useTransactionDetail(network, id);
  const [urlNetwork] = useQueryParam<string>('network');
  const upSm = useMediaQuery('sm');

  const groupedTransactions = useMemo(() => {
    return groupTransactionsByDate(transaction ? [transaction] : []);
  }, [transaction]);

  if (isFetching && !isFetched) {
    return <Spinner size='lg' variant='wave' />;
  }

  if (!transaction) {
    return null;
  }

  return upSm ? (
    <GroupedTransactions groupedTransactions={groupedTransactions} />
  ) : (
    <SubApiRoot network={urlNetwork || network}>
      <SmPage transaction={transaction} />
    </SubApiRoot>
  );
}

export default PageTransactionDetails;
