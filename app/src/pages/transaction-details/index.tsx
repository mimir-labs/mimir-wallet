// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Transaction } from '@/hooks/types';

import { useQueryAccount } from '@/accounts/useQueryAccount';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useTransactionDetail } from '@/hooks/useTransactions';
import { TxCell, TxProgress } from '@/transactions';
import { useParams } from 'react-router-dom';

import { useApi } from '@mimir-wallet/polkadot-core';
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

      <TxProgress account={account} transaction={transaction} className='rounded-large bg-content1' />
    </div>
  );
}

function PageTransactionDetails() {
  const { network } = useApi();
  const { id } = useParams<{ id: string }>();
  const [transaction, isFetched, isFetching] = useTransactionDetail(network, id);
  const upSm = useMediaQuery('sm');

  if (isFetching && !isFetched) {
    return <Spinner size='lg' variant='wave' />;
  }

  if (!transaction) {
    return null;
  }

  if (!upSm) {
    return <SmPage transaction={transaction} />;
  }

  return <TxCell defaultOpen address={transaction.address} transaction={transaction} />;
}

export default PageTransactionDetails;
