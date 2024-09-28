// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Transaction } from '@mimir-wallet/hooks/types';

import { LoadingButton } from '@mui/lab';
import React from 'react';

import { useApi, useTxQueue, useWallet } from '@mimir-wallet/hooks';
import { TransactionType } from '@mimir-wallet/hooks/types';

function Deny({ transaction }: { transaction: Transaction }) {
  const { api } = useApi();
  const { addQueue } = useTxQueue();
  const { accountSource } = useWallet();

  if (transaction.type !== TransactionType.Announce) {
    return null;
  }

  const delegate = transaction.delegate;

  if (!delegate) {
    return null;
  }

  if (!accountSource(transaction.address)) {
    return null;
  }

  return (
    <LoadingButton
      fullWidth
      variant='outlined'
      color='primary'
      onClick={() => {
        addQueue({
          accountId: transaction.address,
          call: api.tx.proxy.rejectAnnouncement(delegate, transaction.callHash)
        });
      }}
    >
      Deny
    </LoadingButton>
  );
}

export default React.memo<typeof Deny>(Deny);
