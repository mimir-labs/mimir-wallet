// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { FunctionCallHandler } from '@mimir-wallet/ai-assistant';

import { toFunctionCallString } from '@mimir-wallet/ai-assistant';
import { NetworkProvider } from '@mimir-wallet/polkadot-core';
import { Button } from '@mimir-wallet/ui';
import { getRouteApi, Link } from '@tanstack/react-router';
import { useCallback, useState } from 'react';

import TransferAction from './TransferAction';
import TransferContent from './TransferContent';

import { useAccount } from '@/accounts/useAccount';
import IconMultiTransfer from '@/assets/svg/icon-multi-transfer.svg?react';
import { NetworkErrorAlert } from '@/components';
import {
  InputTokenAmountProvider,
  useInputTokenAmountContext,
} from '@/components/InputTokenAmount';
import { useRouteDependentHandler } from '@/hooks/useFunctionCallHandler';

const routeApi = getRouteApi('/_authenticated/explorer/$url');

function TransferUI({ initialRecipient }: { initialRecipient?: string }) {
  const { current } = useAccount();
  const [recipient, setRecipient] = useState<string>(initialRecipient || '');

  const {
    network,
    token,
    amount,
    isAmountValid,
    keepAlive,
    setAmount,
    setNetwork,
  } = useInputTokenAmountContext();

  const handleTransferForm = useCallback<FunctionCallHandler>(
    (event) => {
      const recipientValue = toFunctionCallString(event.arguments.recipient);

      if (recipientValue) {
        setRecipient(recipientValue);
      }

      const amountValue = event.arguments.amount;

      if (amountValue !== undefined && amountValue !== null) {
        const amountStr =
          typeof amountValue === 'number'
            ? amountValue.toString()
            : String(amountValue);

        setAmount(amountStr);
      }

      const networkValue = toFunctionCallString(event.arguments.network);

      if (networkValue) {
        setNetwork(networkValue);
      }
    },
    [setAmount, setNetwork],
  );

  useRouteDependentHandler(
    'transferForm',
    '/explorer/mimir%3A%2F%2Fapp%2Ftransfer',
    handleTransferForm,
    {
      displayName: 'Transfer',
    },
  );

  return (
    <NetworkProvider network={network}>
      <div className="mx-auto w-full max-w-[500px] p-4 sm:p-5">
        <Button onClick={() => window.history.back()} variant="ghost">
          {'<'} Back
        </Button>
        <div className="card-root mt-4 p-4 sm:p-6">
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <h3>Transfer</h3>

              <Button asChild color="primary" variant="light">
                <Link
                  to="/explorer/$url"
                  params={{
                    url: 'mimir://app/multi-transfer',
                  }}
                >
                  <IconMultiTransfer />
                  Multi-Transfer
                </Link>
              </Button>
            </div>
            <TransferContent
              disabledSending
              sending={current || ''}
              recipient={recipient}
              setRecipient={setRecipient}
            />

            <NetworkErrorAlert network={network} />

            <TransferAction
              network={network}
              token={token?.token}
              amount={amount}
              isAmountValid={isAmountValid}
              keepAlive={keepAlive}
              sending={current || ''}
              recipient={recipient}
            >
              Review
            </TransferAction>
          </div>
        </div>
      </div>
    </NetworkProvider>
  );
}

function PageTransfer() {
  const { current } = useAccount();
  const search = routeApi.useSearch();
  const assetId = search.assetId || 'native';
  const assetNetwork = search.asset_network;
  const toParam = search.to;

  return (
    <InputTokenAmountProvider
      address={current}
      defaultNetwork={assetNetwork}
      defaultIdentifier={assetId}
    >
      <TransferUI initialRecipient={toParam} />
    </InputTokenAmountProvider>
  );
}

export default PageTransfer;
