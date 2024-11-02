// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { LoadingButton } from '@mui/lab';
import React from 'react';

import { useApi, useTxQueue } from '@mimir-wallet/hooks';
import { type AccountData, type FilterPath, type Transaction, TransactionType } from '@mimir-wallet/hooks/types';

function Approve({
  account,
  transaction,
  filterPaths
}: {
  account: AccountData;
  transaction: Transaction;
  filterPaths: Array<FilterPath[]>;
}) {
  const { api } = useApi();
  const { addQueue } = useTxQueue();

  if (
    (transaction.type !== TransactionType.Multisig && transaction.type !== TransactionType.Proxy) ||
    !filterPaths.length
  ) {
    return null;
  }

  return (
    <LoadingButton
      fullWidth
      variant='contained'
      disabled={!transaction.call}
      onClick={() => {
        if (!transaction.call) {
          return;
        }

        addQueue({
          accountId: account.address,
          call: api.createType('Call', transaction.call),
          transaction
        });
      }}
    >
      Approve
    </LoadingButton>
  );
}

export default React.memo<typeof Approve>(Approve);
