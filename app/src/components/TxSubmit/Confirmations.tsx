// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountData, Transaction } from '@/hooks/types';

import { approvalCounts } from '@/transactions/utils';
import React, { useMemo, useState } from 'react';

import { Button } from '@mimir-wallet/ui';

import TxOverviewDialog from '../TxOverview/TxOverviewDialog';

interface Props {
  account: AccountData;
  transaction: Transaction;
}

function Confirmations({ account, transaction }: Props) {
  const [showOverview, setShowOverview] = useState(false);

  const [confirmations, totalConfirmations] = useMemo(() => {
    return approvalCounts(account, transaction);
  }, [account, transaction]);

  return (
    <>
      <div className='flex flex-row items-center justify-start gap-[5px]'>
        <div className='text-foreground text-sm leading-none font-bold'>Confirmations</div>
        <div className='text-foreground/50 flex-1 text-sm leading-none font-bold'>
          ({confirmations}/{totalConfirmations})
        </div>
        <Button variant='ghost' color='primary' radius='full' onClick={() => setShowOverview(true)}>
          Overview
        </Button>
      </div>

      <TxOverviewDialog
        account={account}
        transaction={transaction}
        open={showOverview}
        showButton={false}
        onClose={() => setShowOverview(false)}
      />
    </>
  );
}

export default React.memo(Confirmations);
