// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Transaction } from '@mimir-wallet/hooks/types';

import { LoadingButton } from '@mui/lab';
import React from 'react';

import { useAccount } from '@mimir-wallet/accounts/useAccount';
import { TransactionStatus, TransactionType } from '@mimir-wallet/hooks/types';
import { useApi } from '@mimir-wallet/hooks/useApi';
import { useTxQueue } from '@mimir-wallet/hooks/useTxQueue';

function Remove({ transaction }: { transaction: Transaction }) {
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

  if (!isLocalAccount(delegate)) {
    return null;
  }

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

export default React.memo<typeof Remove>(Remove);
