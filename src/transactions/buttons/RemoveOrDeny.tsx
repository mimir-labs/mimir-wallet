// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Transaction } from '@mimir-wallet/hooks/types';

import { LoadingButton } from '@mui/lab';
import React from 'react';

import { useAccount } from '@mimir-wallet/accounts/useAccount';
import { TransactionStatus, TransactionType } from '@mimir-wallet/hooks/types';
import { useApi } from '@mimir-wallet/hooks/useApi';
import { useTxQueue } from '@mimir-wallet/hooks/useTxQueue';

function RemoveOrDeny({ transaction }: { transaction: Transaction }) {
  const { api } = useApi();
  const { addQueue } = useTxQueue();
  const { isLocalAccount } = useAccount();

  if (transaction.type !== TransactionType.Announce || transaction.status !== TransactionStatus.Pending) {
    return null;
  }

  const delegate = transaction.delegate;

  if (!delegate) {
    return null;
  }

  if (isLocalAccount(delegate)) {
    return (
      <LoadingButton
        fullWidth
        variant='outlined'
        color='error'
        onClick={() => {
          addQueue({
            accountId: delegate,
            call: api.tx.proxy.removeAnnouncement(transaction.address, transaction.callHash),
            website: 'mimir://internal/remove-announcement'
          });
        }}
      >
        Remove
      </LoadingButton>
    );
  }

  if (isLocalAccount(transaction.address)) {
    return (
      <LoadingButton
        fullWidth
        variant='outlined'
        color='primary'
        onClick={() => {
          addQueue({
            accountId: transaction.address,
            call: api.tx.proxy.rejectAnnouncement(delegate, transaction.callHash),
            website: 'mimir://internal/deny-announcement'
          });
        }}
      >
        Deny
      </LoadingButton>
    );
  }

  return null;
}

export default React.memo<typeof RemoveOrDeny>(RemoveOrDeny);
