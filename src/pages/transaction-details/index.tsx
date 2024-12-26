// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { CircularProgress, Stack, useMediaQuery, useTheme } from '@mui/material';
import { useParams } from 'react-router-dom';

import { useQueryAccount } from '@mimir-wallet/accounts/useQueryAccount';
import { useTransactionDetail } from '@mimir-wallet/hooks/useTransactions';
import { TxCell, TxProgress } from '@mimir-wallet/transactions';

import Details from './Details';
import Summary from './Summary';

function PageTransactionDetails() {
  const { id } = useParams<{ id: string }>();
  const [transaction, isFetched, isFetching] = useTransactionDetail(id);
  const [account, isFetchedAccount, isFetchingAccount] = useQueryAccount(transaction?.address);
  const { breakpoints } = useTheme();
  const downSm = useMediaQuery(breakpoints.down('sm'));

  if ((isFetching || isFetchingAccount) && !isFetched && !isFetchedAccount) {
    return <CircularProgress />;
  }

  if (!account || !transaction) {
    return null;
  }

  if (downSm) {
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

  return <TxCell defaultOpen account={account} transaction={transaction} />;
}

export default PageTransactionDetails;
