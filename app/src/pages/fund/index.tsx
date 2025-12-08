// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { NetworkProvider } from '@mimir-wallet/polkadot-core';
import { Alert, AlertTitle, Button } from '@mimir-wallet/ui';
import { useMemo, useState } from 'react';
import { useToggle } from 'react-use';

import { useAccount } from '@/accounts/useAccount';
import TransferAction from '@/apps/transfer/TransferAction';
import TransferContent from '@/apps/transfer/TransferContent';
import { useAddressSupportedNetworks } from '@/hooks/useAddressSupportedNetwork';
import { useInputNetwork } from '@/hooks/useInputNetwork';
import { useInputNumber } from '@/hooks/useInputNumber';
import { useChainXcmAsset } from '@/hooks/useXcmAssets';
import { useWallet } from '@/wallet/useWallet';

interface FundContentProps {
  filterSending: string[];
  receipt: string;
  network: string;
  supportedNetworks?: string[];
  setNetwork: (network: string) => void;
}

function FundContent({
  filterSending,
  receipt,
  network,
  supportedNetworks,
  setNetwork,
}: FundContentProps) {
  const [sending, setSending] = useState<string>(filterSending.at(0) || '');
  const [keepAlive, toggleKeepAlive] = useToggle(true);
  const [[amount, isAmountValid], setAmount] = useInputNumber('', false, 0);
  const [assetId, setAssetId] = useState('native');
  const [assets] = useChainXcmAsset(network);
  const token = useMemo(() => {
    const foundAsset = assets?.find((item) =>
      assetId === 'native' ? item.isNative : item.key === assetId,
    );

    return foundAsset;
  }, [assetId, assets]);
  const [error, setError] = useState<string | null>(null);

  return (
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
            amount={amount}
            isAmountValid={isAmountValid}
            keepAlive={keepAlive}
            token={token}
            identifier={assetId}
            sending={sending}
            recipient={receipt}
            network={network}
            supportedNetworks={supportedNetworks}
            setSending={setSending}
            setNetwork={setNetwork}
            setAmount={setAmount}
            toggleKeepAlive={toggleKeepAlive}
            setToken={setAssetId}
          />

          {error && (
            <Alert variant="destructive">
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
  );
}

function PageFund() {
  const { walletAccounts } = useWallet();
  const { current: receipt } = useAccount();

  const filterSending = walletAccounts.map((item) => item.address);
  const supportedNetworks = useAddressSupportedNetworks(receipt);
  const [network, setNetwork] = useInputNetwork(
    undefined,
    supportedNetworks?.map((item) => item.key),
  );

  // Enable network when it changes
  const handleSetNetwork = (newNetwork: string) => {
    setNetwork(newNetwork);
  };

  if (!receipt) {
    return null;
  }

  return (
    <NetworkProvider network={network}>
      <FundContent
        filterSending={filterSending}
        receipt={receipt}
        network={network}
        supportedNetworks={supportedNetworks?.map((item) => item.key)}
        setNetwork={handleSetNetwork}
      />
    </NetworkProvider>
  );
}

export default PageFund;
