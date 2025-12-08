// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { TxSubmitProps } from './types';

import { NetworkProvider } from '@mimir-wallet/polkadot-core';
import { Spinner } from '@mimir-wallet/ui';

import TxSubmit from './TxSubmit';
import TxSubmitErrorBoundary from './TxSubmitErrorBoundary';

import { useQueryAccount } from '@/accounts/useQueryAccount';

function Content({ accountId, ...props }: TxSubmitProps) {
  const [accountData] = useQueryAccount(accountId);

  if (!accountData) {
    return (
      <div className="flex h-auto w-full flex-col items-center justify-center gap-5 p-4 sm:p-5 md:h-[calc(100dvh-160px)]">
        <Spinner
          size="lg"
          variant="ellipsis"
          label={'Fetching account data...'}
        />
      </div>
    );
  }

  return (
    <TxSubmitErrorBoundary>
      <TxSubmit {...props} accountData={accountData} />
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
