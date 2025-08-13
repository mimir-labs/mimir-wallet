// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Transaction } from '@/hooks/types';

import { useQueryAccount } from '@/accounts/useQueryAccount';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useTransactionDetail } from '@/hooks/useTransactions';
import React, { useState } from 'react';

import { useApi } from '@mimir-wallet/polkadot-core';
import { Spinner } from '@mimir-wallet/ui';

import TxItems from './TxItems';
import TxItemsSmall from './TxItemsSmall';

interface Props {
  withDetails?: boolean;
  defaultOpen?: boolean;
  address: string;
  transaction: Transaction;
}

function TxCell({ withDetails, defaultOpen, address, transaction: propsTransaction }: Props) {
  const upSm = useMediaQuery('sm');
  const { network, isApiReady } = useApi();
  const [account] = useQueryAccount(address);

  // State for loading full transaction details
  const [shouldLoadDetails, setShouldLoadDetails] = useState(false);
  const [fullTransaction] = useTransactionDetail(
    network,
    shouldLoadDetails ? propsTransaction.id.toString() : undefined
  );

  // Use full transaction if loaded, otherwise use original
  const transaction = fullTransaction || propsTransaction;

  // Check if transaction has large calls
  const hasLargeCalls = !!transaction.isLargeCall;

  return isApiReady && account ? (
    upSm ? (
      <TxItems
        withDetails={withDetails}
        defaultOpen={defaultOpen}
        account={account}
        transaction={transaction}
        hasLargeCalls={hasLargeCalls}
        shouldLoadDetails={shouldLoadDetails}
        onLoadDetails={() => setShouldLoadDetails(true)}
      />
    ) : (
      <TxItemsSmall transaction={transaction} />
    )
  ) : (
    <div className='flex h-[100px] items-center justify-center'>
      <Spinner size='lg' variant='wave' />
    </div>
  );
}

export default React.memo(TxCell);
