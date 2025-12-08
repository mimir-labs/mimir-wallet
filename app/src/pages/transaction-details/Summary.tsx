// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Transaction } from '@/hooks/types';

import { Divider } from '@mimir-wallet/ui';
import React from 'react';

import { AppName } from '@/components';
import { TransactionStatus } from '@/hooks/types';
import { CallDisplaySection } from '@/params';
import { formatTransactionId, Status } from '@/transactions';
import { formatDate } from '@/utils';

function Summary({ transaction }: { transaction: Transaction }) {
  return (
    <div className="card-root space-y-2.5 p-4">
      <p>
        {transaction.status < TransactionStatus.Success
          ? formatDate(transaction.createdAt)
          : formatDate(transaction.updatedAt)}
      </p>

      <Divider />

      <h4 className="text-primary">{formatTransactionId(transaction.id)}</h4>

      <Divider />

      <div className="flex items-center justify-between gap-7">
        <AppName
          website={transaction.website}
          appName={transaction.appName}
          iconUrl={transaction.iconUrl}
        />
        <Status transaction={transaction} />
        <CallDisplaySection
          section={transaction.section}
          method={transaction.method}
        />
      </div>
    </div>
  );
}

export default React.memo(Summary);
