// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { TxSubmitProps } from './types';

import { NetworkProvider, useNetwork } from '@mimir-wallet/polkadot-core';
import { Spinner } from '@mimir-wallet/ui';

import TxSubmit from './TxSubmit';
import TxSubmitErrorBoundary from './TxSubmitErrorBoundary';

import { useQueryAccount } from '@/accounts/useQueryAccount';
import { useTransactionDetail } from '@/hooks/useTransactions';

function Content({
  accountId,
  transaction: initialTransaction,
  ...props
}: TxSubmitProps) {
  const { network } = useNetwork();
  const [accountData] = useQueryAccount(accountId);

  // Refresh transaction state to prevent race conditions
  // Use transaction id to fetch latest state from server
  const txId = initialTransaction?.id?.toString();
  const [refreshedTransaction, , isTransactionFetching] = useTransactionDetail(
    network,
    txId,
  );

  // Use refreshed transaction if available, otherwise fall back to initial
  const transaction = txId
    ? (refreshedTransaction ?? null)
    : initialTransaction;

  if (
    !accountData ||
    (txId && isTransactionFetching && !refreshedTransaction)
  ) {
    return (
      <div className="flex h-auto w-full flex-col items-center justify-center gap-5 p-4 sm:p-5 md:h-[calc(100dvh-160px)]">
        <Spinner
          size="lg"
          variant="ellipsis"
          label={
            !accountData ? 'Fetching account data...' : 'Loading transaction...'
          }
        />
      </div>
    );
  }

  return (
    <TxSubmitErrorBoundary>
      <TxSubmit
        {...props}
        accountData={accountData}
        transaction={transaction}
      />
    </TxSubmitErrorBoundary>
  );
}

function TxSubmitRoot({
  network,
  ...props
}: TxSubmitProps & { network: string }) {
  return (
    <NetworkProvider network={network}>
      <Content {...props} />
    </NetworkProvider>
  );
}

export default TxSubmitRoot;
