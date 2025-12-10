// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { NetworkProvider } from '@mimir-wallet/polkadot-core';
import { Alert, AlertTitle, Button } from '@mimir-wallet/ui';
import { useState } from 'react';

import { useAccount } from '@/accounts/useAccount';
import TransferAction from '@/apps/transfer/TransferAction';
import TransferContent from '@/apps/transfer/TransferContent';
import { NetworkErrorAlert } from '@/components';
import {
  InputTokenAmountProvider,
  useInputTokenAmountContext,
} from '@/components/InputTokenAmount';
import { useWallet } from '@/wallet/useWallet';

interface FundUIProps {
  filterSending: string[];
  receipt: string;
}

function FundUI({ filterSending, receipt }: FundUIProps) {
  const [sending, setSending] = useState<string>(filterSending.at(0) || '');
  const [error, setError] = useState<string | null>(null);

  const { network, token, amount, isAmountValid, keepAlive } =
    useInputTokenAmountContext();

  return (
    <NetworkProvider network={network}>
      <div className="mx-auto w-full max-w-[500px] p-4 sm:p-5">
        <Button onClick={() => window.history.back()} variant="ghost">
          {'<'} Back
        </Button>
        <div className="card-root mt-4 p-4 sm:p-6">
          <div className="flex flex-col gap-5">
            <h3>Fund</h3>
            <TransferContent
              disabledRecipient
              filterSending={filterSending}
              sending={sending}
              recipient={receipt}
              setSending={setSending}
            />

            {error && (
              <Alert variant="destructive">
                <AlertTitle>{error}</AlertTitle>
              </Alert>
            )}

            <NetworkErrorAlert network={network} />

            <TransferAction
              network={network}
              token={token?.token}
              amount={amount}
              isAmountValid={isAmountValid}
              keepAlive={keepAlive}
              sending={sending}
              recipient={receipt}
              onDone={() => setError(null)}
              onError={(err: unknown) => {
                const message =
                  err instanceof Error ? err.message : 'Something went wrong';

                setError(message);
              }}
            >
              Submit
            </TransferAction>
          </div>
        </div>
      </div>
    </NetworkProvider>
  );
}

function PageFund() {
  const { walletAccounts } = useWallet();
  const { current: receipt } = useAccount();

  const filterSending = walletAccounts.map((item) => item.address);

  if (!receipt) {
    return null;
  }

  return (
    <InputTokenAmountProvider
      address={filterSending.at(0)}
      defaultIdentifier="native"
    >
      <FundUI filterSending={filterSending} receipt={receipt} />
    </InputTokenAmountProvider>
  );
}

export default PageFund;
