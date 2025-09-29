// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useAccount } from '@/accounts/useAccount';
import TransferAction from '@/apps/transfer/TransferAction';
import TransferContent from '@/apps/transfer/TransferContent';
import { useAddressSupportedNetworks } from '@/hooks/useAddressSupportedNetwork';
import { useInputNetwork } from '@/hooks/useInputNetwork';
import { useInputNumber } from '@/hooks/useInputNumber';
import { useChainXcmAsset } from '@/hooks/useXcmAssets';
import { useWallet } from '@/wallet/useWallet';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToggle } from 'react-use';

import { SubApiRoot } from '@mimir-wallet/polkadot-core';
import { Alert, AlertTitle, Button, Spinner } from '@mimir-wallet/ui';

function PageFund() {
  const navigate = useNavigate();
  const { walletAccounts } = useWallet();
  const { current: receipt } = useAccount();

  const filterSending = walletAccounts.map((item) => item.address);

  const [sending, setSending] = useState<string>(filterSending.at(0) || '');
  const supportedNetworks = useAddressSupportedNetworks(receipt);
  const [network, setNetwork] = useInputNetwork(
    undefined,
    supportedNetworks?.map((item) => item.key)
  );
  const [keepAlive, toggleKeepAlive] = useToggle(true);
  const [[amount, isAmountValid], setAmount] = useInputNumber('', false, 0);
  const [assetId, setAssetId] = useState('native');
  const [assets] = useChainXcmAsset(network);
  const token = useMemo(() => {
    const foundAsset = assets?.find((item) => (assetId === 'native' ? item.isNative : item.key === assetId));

    return foundAsset;
  }, [assetId, assets]);
  const [error, setError] = useState<string | null>(null);

  if (!receipt) {
    return null;
  }

  return (
    <SubApiRoot
      network={network}
      supportedNetworks={supportedNetworks?.map((item) => item.key)}
      Fallback={({ apiState: { chain } }) => (
        <div className='bg-content1 mx-auto mt-16 flex w-[500px] max-w-full items-center justify-center rounded-[20px] py-10'>
          <Spinner size='lg' variant='wave' label={`Connecting to the ${chain.name}...`} />
        </div>
      )}
    >
      <div className='mx-auto w-full max-w-[500px] p-4 sm:p-5'>
        <Button onClick={() => navigate(-1)} variant='ghost'>
          {'<'} Back
        </Button>
        <div className='border-secondary bg-content1 shadow-medium mt-4 rounded-[20px] border-1 p-4 sm:p-6'>
          <div className='flex flex-col gap-5'>
            <h3>Fund</h3>
            <TransferContent
              disabledRecipient
              filterSending={filterSending}
              amount={amount}
              isAmountValid={isAmountValid}
              keepAlive={keepAlive}
              token={token}
              identifier={assetId}
              sending={sending}
              recipient={receipt}
              network={network}
              setSending={setSending}
              setNetwork={setNetwork}
              setAmount={setAmount}
              toggleKeepAlive={toggleKeepAlive}
              setToken={setAssetId}
            />

            {error && (
              <Alert variant='destructive'>
                <AlertTitle>{error}</AlertTitle>
              </Alert>
            )}

            <TransferAction
              network={network}
              token={token}
              amount={amount}
              isAmountValid={isAmountValid}
              keepAlive={keepAlive}
              sending={sending}
              recipient={receipt}
              onDone={() => setError(null)}
              onError={(err: unknown) => {
                const message = err instanceof Error ? err.message : 'Something went wrong';

                setError(message);
              }}
            >
              Submit
            </TransferAction>
          </div>
        </div>
      </div>
    </SubApiRoot>
  );
}

export default PageFund;
