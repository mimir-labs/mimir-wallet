// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { TxButton } from '@/components';
import { type AccountData, type FilterPath, type Transaction, TransactionType } from '@/hooks/types';
import { useApi } from '@/hooks/useApi';
import React from 'react';

function Approve({
  account,
  transaction,
  filterPaths
}: {
  account: AccountData;
  transaction: Transaction;
  filterPaths: FilterPath[][];
}) {
  const { api } = useApi();

  if (
    (transaction.type !== TransactionType.Multisig &&
      transaction.type !== TransactionType.Proxy &&
      transaction.type !== TransactionType.Propose) ||
    !filterPaths.length
  ) {
    return null;
  }

  return (
    <TxButton
      fullWidth
      variant='solid'
      color='primary'
      isDisabled={!transaction.call}
      accountId={account.address}
      transaction={transaction}
      getCall={() => api.createType('Call', transaction.call)}
    >
      Approve
    </TxButton>
  );
}

export default React.memo<typeof Approve>(Approve);
