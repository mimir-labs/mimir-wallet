// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Transaction } from '@/hooks/types';

import { useAccount } from '@/accounts/useAccount';
import { TxButton } from '@/components';
import { TransactionStatus, TransactionType } from '@/hooks/types';
import React from 'react';

import { useApi } from '@mimir-wallet/polkadot-core';

function RemoveOrDeny({ transaction }: { transaction: Transaction }) {
  const { api } = useApi();
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
      <TxButton
        fullWidth
        variant='ghost'
        color='danger'
        accountId={delegate}
        website='mimir://internal/remove-announcement'
        getCall={() => api.tx.proxy.removeAnnouncement(transaction.address, transaction.callHash)}
      >
        Remove
      </TxButton>
    );
  }

  if (isLocalAccount(transaction.address)) {
    return (
      <TxButton
        fullWidth
        variant='ghost'
        color='primary'
        accountId={transaction.address}
        website='mimir://internal/deny-announcement'
        getCall={() => api.tx.proxy.rejectAnnouncement(delegate, transaction.callHash)}
      >
        Deny
      </TxButton>
    );
  }

  return null;
}

export default React.memo<typeof RemoveOrDeny>(RemoveOrDeny);
