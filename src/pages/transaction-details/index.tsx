// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { CircularProgress, Stack } from '@mui/material';
import { useParams } from 'react-router-dom';

import { useQueryAccount, useTransactionDetail } from '@mimir-wallet/hooks';
import { TxProgress } from '@mimir-wallet/transactions';

import Details from './Details';
import Summary from './Summary';

function PageTransactionDetails() {
  const { id } = useParams<{ id: string }>();
  const [transaction, isFetched, isFetching] = useTransactionDetail(id);
  const [account, isFetchedAccount, isFetchingAccount] = useQueryAccount(transaction?.address);

  if ((isFetching || isFetchingAccount) && !isFetched && !isFetchedAccount) {
    return <CircularProgress />;
  }

  if (!account || !transaction) {
    return null;
  }

  return (
    <Stack spacing={1.5}>
      <Summary transaction={transaction} />

      <Details transaction={transaction} />

      <TxProgress
        account={account}
        transaction={transaction}
        sx={{
          borderRadius: 2,
          bgcolor: 'background.paper'
        }}
      />
    </Stack>
  );
}

export default PageTransactionDetails;
