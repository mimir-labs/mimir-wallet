// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Transaction } from '@/hooks/types';

import { useQueryAccount } from '@/accounts/useQueryAccount';
import { useTransactionDetail } from '@/hooks/useTransactions';
import { TxCell, TxProgress } from '@/transactions';
import { Stack, useMediaQuery, useTheme } from '@mui/material';
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
    <Stack spacing={1.5}>
      <Summary transaction={transaction} />

      <Details transaction={transaction} />

      <TxProgress account={account} transaction={transaction} className='rounded-large bg-content1' />
    </Stack>
  );
}

function PageTransactionDetails() {
  const { network } = useApi();
  const { id } = useParams<{ id: string }>();
  const [transaction, isFetched, isFetching] = useTransactionDetail(network, id);
  const { breakpoints } = useTheme();
  const downSm = useMediaQuery(breakpoints.down('sm'));

  if (isFetching && !isFetched) {
    return <Spinner size='lg' variant='wave' />;
  }

  if (!transaction) {
    return null;
  }

  if (downSm) {
    return <SmPage transaction={transaction} />;
  }

  return <TxCell defaultOpen address={transaction.address} transaction={transaction} />;
}

export default PageTransactionDetails;
