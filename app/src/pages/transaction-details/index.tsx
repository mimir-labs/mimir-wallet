// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useQueryAccount } from '@/accounts/useQueryAccount';
import { useTransactionDetail } from '@/hooks/useTransactions';
import { TxCell, TxProgress } from '@/transactions';
import { Stack, useMediaQuery, useTheme } from '@mui/material';
import { useParams } from 'react-router-dom';

import { Spinner } from '@mimir-wallet/ui';

import Details from './Details';
import Summary from './Summary';

function PageTransactionDetails() {
  const { id } = useParams<{ id: string }>();
  const [transaction, isFetched, isFetching] = useTransactionDetail(id);
  const [account, isFetchedAccount, isFetchingAccount] = useQueryAccount(transaction?.address);
  const { breakpoints } = useTheme();
  const downSm = useMediaQuery(breakpoints.down('sm'));

  if ((isFetching || isFetchingAccount) && !isFetched && !isFetchedAccount) {
    return <Spinner />;
  }

  if (!(account && transaction)) {
    return null;
  }

  if (downSm) {
    return (
      <Stack spacing={1.5}>
        <Summary transaction={transaction} />

        <Details transaction={transaction} />

        <TxProgress account={account} transaction={transaction} className='rounded-large bg-content1' />
      </Stack>
    );
  }

  return <TxCell defaultOpen account={account} transaction={transaction} />;
}

export default PageTransactionDetails;
