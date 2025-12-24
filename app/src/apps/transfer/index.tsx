// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { FunctionCallHandler } from '@mimir-wallet/ai-assistant';

import { toFunctionCallString } from '@mimir-wallet/ai-assistant';
import { NetworkProvider } from '@mimir-wallet/polkadot-core';
import { Divider } from '@mimir-wallet/ui';
import { getRouteApi } from '@tanstack/react-router';
import { useCallback, useMemo, useState } from 'react';

import TransferAction from './TransferAction';
import TransferContent from './TransferContent';

import { useAccount } from '@/accounts/useAccount';
import { NetworkErrorAlert } from '@/components';
import {
  InputNetworkTokenProvider,
  useInputNetworkTokenContext,
} from '@/components/InputNetworkToken';
import { useAddressSupportedNetworks } from '@/hooks/useAddressSupportedNetwork';
import { useRouteDependentHandler } from '@/hooks/useFunctionCallHandler';
import { useInputNumber } from '@/hooks/useInputNumber';

const routeApi = getRouteApi('/_authenticated/explorer/$url');

function TransferUI({ initialRecipient }: { initialRecipient?: string }) {
  const { current } = useAccount();
  const [recipient, setRecipient] = useState<string>(initialRecipient || '');

  // Amount state managed locally
  const [[amount, isAmountValid], setAmount] = useInputNumber('', false, 0);

  const { network, token, keepAlive, setNetwork } =
    useInputNetworkTokenContext();

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
      <div className="card-root p-3 sm:p-6 flex flex-col gap-5">
        <h4 className="font-extrabold">Transfer</h4>

        <Divider />

        <TransferContent
          disabledSending
          sending={current || ''}
          recipient={recipient}
          setRecipient={setRecipient}
          amount={amount}
          isAmountValid={isAmountValid}
          setAmount={setAmount}
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
    </NetworkProvider>
  );
}

function PageTransfer() {
  const { current } = useAccount();
  const search = routeApi.useSearch();
  const assetId = search.assetId || 'native';
  const assetNetwork = search.asset_network;
  const toParam = search.to;

  // Get supported networks for pure proxy accounts
  const supportedNetworks = useAddressSupportedNetworks(current);
  const supportedNetworkKeys = useMemo(
    () => supportedNetworks?.map((n) => n.key),
    [supportedNetworks],
  );

  return (
    <InputNetworkTokenProvider
      address={current}
      defaultNetwork={assetNetwork}
      defaultIdentifier={assetId}
      supportedNetworks={supportedNetworkKeys}
    >
      <TransferUI initialRecipient={toParam} />
    </InputNetworkTokenProvider>
  );
}

export default PageTransfer;
