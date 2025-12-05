// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Transaction } from '@/hooks/types';

import { NetworkProvider, useNetwork } from '@mimir-wallet/polkadot-core';
import { Spinner } from '@mimir-wallet/ui';
import { useParams } from '@tanstack/react-router';
import { useMemo, useState } from 'react';

import Summary from './Summary';

import { useQueryAccount } from '@/accounts/useQueryAccount';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useParseCall } from '@/hooks/useParseCall';
import { useTransactionDetail } from '@/hooks/useTransactions';
import { GroupedTransactions, TxProgress } from '@/transactions';
import { groupTransactionsByDate } from '@/transactions/transactionDateGrouping';
import Extrinsic from '@/transactions/TxCell/Extrinsic';

function SmPage({ transaction: propsTransaction }: { transaction: Transaction }) {
  const { network } = useNetwork();
  const [account] = useQueryAccount(propsTransaction?.address);
  const [shouldLoadDetails, setShouldLoadDetails] = useState(false);
  const [fullTransaction] = useTransactionDetail(
    network,
    shouldLoadDetails ? propsTransaction.id.toString() : undefined
  );
  // Use full transaction if loaded, otherwise use original
  const transaction = fullTransaction || propsTransaction;

  // Parse call data using async hook
  const { call } = useParseCall(network, transaction.call);

  if (!account) {
    return null;
  }

  return (
    <div className='space-y-4'>
      <Summary transaction={transaction} />

      <Extrinsic
        isMobile
        transaction={transaction}
        call={call}
        hasLargeCalls={!!transaction.isLargeCall}
        shouldLoadDetails={shouldLoadDetails}
        onLoadDetails={() => setShouldLoadDetails(true)}
      />

      <TxProgress
        account={account}
        transaction={transaction}
        className='bg-background rounded-[20px] p-[15px] shadow-md'
      />
    </div>
  );
}

function PageTransactionDetails() {
  const { id } = useParams({ from: '/_authenticated/transactions/$id' });
  const [transaction, isFetched, isFetching] = useTransactionDetail('polkadot', id);
  const upSm = useMediaQuery('sm');

  const groupedTransactions = useMemo(() => {
    return groupTransactionsByDate(transaction ? [transaction] : []);
  }, [transaction]);

  if (isFetching && !isFetched) {
    return <Spinner size='lg' variant='ellipsis' />;
  }

  if (!transaction) {
    return null;
  }

  return upSm ? (
    <GroupedTransactions groupedTransactions={groupedTransactions} />
  ) : (
    <NetworkProvider network={transaction.network}>
      <SmPage transaction={transaction} />
    </NetworkProvider>
  );
}

export default PageTransactionDetails;
