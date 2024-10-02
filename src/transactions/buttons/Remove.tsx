// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Transaction } from '@mimir-wallet/hooks/types';

import { LoadingButton } from '@mui/lab';
import React from 'react';

import { useApi, useTxQueue, useWallet } from '@mimir-wallet/hooks';
import { TransactionType } from '@mimir-wallet/hooks/types';

function Remove({ transaction }: { transaction: Transaction }) {
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

  if (!accountSource(delegate)) {
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
