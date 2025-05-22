// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Transaction } from '@/hooks/types';

import { AppName } from '@/components';
import { TransactionStatus } from '@/hooks/types';
import { CallDisplaySection } from '@/params';
import { formatTransactionId, Status } from '@/transactions';
import moment from 'moment';
import React from 'react';

import { Divider } from '@mimir-wallet/ui';

function Summary({ transaction }: { transaction: Transaction }) {
  return (
    <div className='space-y-2.5 rounded-large bg-content1 border-1 border-secondary shadow-medium p-4'>
      <p>
        {transaction.status < TransactionStatus.Success
          ? moment(transaction.createdAt).format()
          : moment(transaction.updatedAt).format()}
      </p>

      <Divider />

      <h4 className='text-primary'>{formatTransactionId(transaction.id)}</h4>

      <Divider />

      <div className='flex justify-between items-center gap-7'>
        <AppName website={transaction.website} appName={transaction.appName} iconUrl={transaction.iconUrl} />
        <Status transaction={transaction} />
        <CallDisplaySection section={transaction.section} method={transaction.method} />
      </div>
    </div>
  );
}

export default React.memo(Summary);
