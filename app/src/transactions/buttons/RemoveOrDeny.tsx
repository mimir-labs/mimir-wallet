// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Transaction } from '@/hooks/types';

import { useAccount } from '@/accounts/useAccount';
import IconFailed from '@/assets/svg/icon-failed-outlined.svg?react';
import { TxButton } from '@/components';
import { TransactionStatus, TransactionType } from '@/hooks/types';
import React from 'react';

import { useApi } from '@mimir-wallet/polkadot-core';
import { Tooltip } from '@mimir-wallet/ui';

function RemoveOrDeny({ isIcon = false, transaction }: { isIcon?: boolean; transaction: Transaction }) {
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
      <Tooltip content={isIcon ? 'Remove' : null}>
        <TxButton
          isIconOnly={isIcon}
          fullWidth={!isIcon}
          variant={isIcon ? 'light' : 'ghost'}
          size={isIcon ? 'sm' : 'md'}
          color='danger'
          accountId={delegate}
          website='mimir://internal/remove-announcement'
          getCall={() => api.tx.proxy.removeAnnouncement(transaction.address, transaction.callHash)}
        >
          {isIcon ? <IconFailed /> : 'Remove'}
        </TxButton>
      </Tooltip>
    );
  }

  if (isLocalAccount(transaction.address)) {
    return (
      <Tooltip content={isIcon ? 'Deny' : null}>
        <TxButton
          isIconOnly={isIcon}
          fullWidth={!isIcon}
          variant={isIcon ? 'light' : 'ghost'}
          size={isIcon ? 'sm' : 'md'}
          color={isIcon ? 'danger' : 'primary'}
          accountId={transaction.address}
          website='mimir://internal/deny-announcement'
          getCall={() => api.tx.proxy.rejectAnnouncement(delegate, transaction.callHash)}
        >
          {isIcon ? <IconFailed /> : 'Deny'}
        </TxButton>
      </Tooltip>
    );
  }

  return null;
}

export default React.memo<typeof RemoveOrDeny>(RemoveOrDeny);
