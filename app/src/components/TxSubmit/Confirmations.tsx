// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountData, Transaction } from '@/hooks/types';

import { Button } from '@mimir-wallet/ui';
import React, { lazy, Suspense, useMemo, useState } from 'react';

import FlowSkeleton from '../FlowSkeleton';

import { approvalCounts } from '@/transactions/utils';

const TxOverviewDialog = lazy(() => import('../TxOverview/TxOverviewDialog'));

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
      <div className="flex flex-row items-center justify-start gap-[5px]">
        <div className="text-foreground text-sm leading-none font-bold">
          Confirmations
        </div>
        <div className="text-foreground/50 flex-1 text-sm leading-none font-bold">
          ({confirmations}/{totalConfirmations})
        </div>
        <Button
          variant="ghost"
          color="primary"
          radius="full"
          onClick={() => setShowOverview(true)}
        >
          Overview
        </Button>
      </div>

      <Suspense fallback={<FlowSkeleton className="h-[50dvh]" />}>
        <TxOverviewDialog
          account={account}
          transaction={transaction}
          open={showOverview}
          showButton={false}
          onClose={() => setShowOverview(false)}
        />
      </Suspense>
    </>
  );
}

export default React.memo(Confirmations);
