// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useSelectedAccount } from '@/accounts/useSelectedAccount';
import IconMultiTransfer from '@/assets/svg/icon-multi-transfer.svg?react';
import { useAddressSupportedNetworks } from '@/hooks/useAddressSupportedNetwork';
import { useRouteDependentHandler } from '@/hooks/useFunctionCallHandler';
import { useInputNetwork } from '@/hooks/useInputNetwork';
import { useInputNumber } from '@/hooks/useInputNumber';
import { useChainXcmAsset } from '@/hooks/useXcmAssets';
import { getRouteApi, Link, useNavigate } from '@tanstack/react-router';
import { useCallback, useMemo, useState } from 'react';
import { useToggle } from 'react-use';

const routeApi = getRouteApi('/_authenticated/explorer/$url');

import { type FunctionCallHandler, toFunctionCallString } from '@mimir-wallet/ai-assistant';
import { NetworkProvider } from '@mimir-wallet/polkadot-core';
import { Button } from '@mimir-wallet/ui';

import TransferAction from './TransferAction';
import TransferContent from './TransferContent';

function PageTransfer() {
  const selected = useSelectedAccount();
  const navigate = useNavigate();
  const search = routeApi.useSearch();
  const fromParam = search.from;
  const assetId = search.assetId || 'native';
  const assetNetwork = search.asset_network;
  const toParam = search.to;

  const setAssetId = (newAssetId: string) => {
    navigate({
      to: '.',
      search: { ...search, assetId: newAssetId },
      replace: true
    });
  };

  const [sending, setSending] = useState<string>(fromParam || selected || '');
  const [recipient, setRecipient] = useState<string>(toParam || '');
  const supportedNetworks = useAddressSupportedNetworks(sending);
  const [network, setNetwork] = useInputNetwork(
    assetNetwork,
    supportedNetworks?.map((item) => item.key)
  );
  const [keepAlive, toggleKeepAlive] = useToggle(true);
  const [[amount, isAmountValid], setAmount] = useInputNumber('', false, 0);
  const [assets] = useChainXcmAsset(network);
  const token = useMemo(() => {
    const foundAsset = assets?.find((item) => (assetId === 'native' ? item.isNative : item.key === assetId));

    return foundAsset;
  }, [assetId, assets]);

  const handleTransferForm = useCallback<FunctionCallHandler>(
    (event) => {
      // No need to check event.name - only 'transferForm' events arrive here

      // Safe type conversion for sending
      const sendingValue = toFunctionCallString(event.arguments.sending);

      if (sendingValue) {
        setSending(sendingValue);
      }

      // Safe type conversion for recipient
      const recipientValue = toFunctionCallString(event.arguments.recipient);

      if (recipientValue) {
        setRecipient(recipientValue);
      }

      // Safe type conversion for amount
      const amountValue = event.arguments.amount;

      if (amountValue !== undefined && amountValue !== null) {
        const amountStr = typeof amountValue === 'number' ? amountValue.toString() : String(amountValue);

        setAmount(amountStr);
      }

      // Safe type conversion for network
      const networkValue = toFunctionCallString(event.arguments.network);

      if (networkValue) {
        setNetwork(networkValue);
      }
    },
    [setAmount, setNetwork]
  );

  useRouteDependentHandler('transferForm', '/explorer/mimir%3A%2F%2Fapp%2Ftransfer', handleTransferForm, {
    displayName: 'Transfer'
  });

  return (
    <NetworkProvider network={network}>
      <div className='mx-auto w-full max-w-[500px] p-4 sm:p-5'>
        <Button onClick={() => window.history.back()} variant='ghost'>
          {'<'} Back
        </Button>
        <div className='border-secondary bg-content1 shadow-medium mt-4 rounded-[20px] border-1 p-4 sm:p-6'>
          <div className='flex flex-col gap-5'>
            <div className='flex items-center justify-between'>
              <h3>Transfer</h3>

              <Button asChild color='primary' variant='light'>
                <Link
                  to='/explorer/$url'
                  params={{
                    url: 'mimir://app/multi-transfer'
                  }}
                >
                  <IconMultiTransfer />
                  Multi-Transfer
                </Link>
              </Button>
            </div>
            <TransferContent
              amount={amount}
              isAmountValid={isAmountValid}
              keepAlive={keepAlive}
              token={token}
              sending={sending}
              recipient={recipient}
              identifier={assetId}
              network={network}
              setSending={setSending}
              setNetwork={setNetwork}
              setRecipient={setRecipient}
              setAmount={setAmount}
              toggleKeepAlive={toggleKeepAlive}
              setToken={setAssetId}
            />
            <TransferAction
              network={network}
              token={token}
              amount={amount}
              isAmountValid={isAmountValid}
              keepAlive={keepAlive}
              sending={sending}
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

export default PageTransfer;
