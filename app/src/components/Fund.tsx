// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { NetworkProvider } from '@mimir-wallet/polkadot-core';
import {
  Alert,
  AlertTitle,
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@mimir-wallet/ui';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useToggle } from 'react-use';

import NetworkErrorAlert from './NetworkErrorAlert';

import TransferAction from '@/apps/transfer/TransferAction';
import TransferContent from '@/apps/transfer/TransferContent';
import { useAddressSupportedNetworks } from '@/hooks/useAddressSupportedNetwork';
import { useInputNetwork } from '@/hooks/useInputNetwork';
import { useInputNumber } from '@/hooks/useInputNumber';
import { useChainXcmAsset } from '@/hooks/useXcmAssets';
import { useWallet } from '@/wallet/useWallet';

interface Props {
  defaultNetwork?: string;
  open: boolean;
  defaultValue?: string | { toString: () => string };
  receipt?: string;
  onClose: () => void;
}

// Inner content component that uses network context
function FundContent({
  defaultValue,
  onClose,
  open,
  receipt,
  filterSending,
  network,
  supportedNetworks,
  setNetwork,
}: {
  defaultValue?: string | { toString: () => string };
  onClose: () => void;
  open: boolean;
  receipt?: string;
  filterSending: string[];
  network: string;
  supportedNetworks?: string[];
  setNetwork: (network: string) => void;
}) {
  const [sending, setSending] = useState<string>(filterSending.at(0) || '');
  const [keepAlive, toggleKeepAlive] = useToggle(true);
  const [[amount, isAmountValid], setAmount] = useInputNumber(
    defaultValue?.toString() || '',
    false,
    0,
  );
  const [assetId, setAssetId] = useState('native');
  const [assets] = useChainXcmAsset(network);
  const token = useMemo(() => {
    const foundAsset = assets?.find((item) =>
      assetId === 'native' ? item.isNative : item.key === assetId,
    );

    return foundAsset;
  }, [assetId, assets]);
  const [error, setError] = useState<string | null>(null);
  const prevOpenRef = useRef(open);

  useEffect(() => {
    // Reset form when dialog closes (transition from true to false)
    if (prevOpenRef.current && !open) {
      queueMicrotask(() => {
        setError(null);
        setAmount('');
        setAssetId('native');
        toggleKeepAlive(true);
      });
    }

    prevOpenRef.current = open;
  }, [open, setAmount, toggleKeepAlive]);

  return (
    <Modal size="lg" onClose={onClose} isOpen={open}>
      <ModalContent>
        <ModalHeader>Fund</ModalHeader>

        <ModalBody className="flex flex-col gap-5">
          {receipt && (
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
          )}

          {error && (
            <Alert variant="destructive">
              <AlertTitle>{error}</AlertTitle>
            </Alert>
          )}
        </ModalBody>

        <ModalFooter className="flex-col sm:flex-col">
          <NetworkErrorAlert network={network} />

          <div className="flex items-center gap-2.5">
            <Button fullWidth onClick={onClose} variant="ghost">
              Cancel
            </Button>

            {receipt && (
              <TransferAction
                network={network}
                token={token}
                amount={amount}
                isAmountValid={isAmountValid}
                keepAlive={keepAlive}
                sending={sending}
                recipient={receipt}
                onDone={() => {
                  setError(null);
                  onClose();
                }}
                onError={(error: any) => {
                  setError(error.message || 'Something went wrong');
                }}
              >
                Submit
              </TransferAction>
            )}
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

function Fund({ defaultValue, defaultNetwork, onClose, open, receipt }: Props) {
  const { walletAccounts } = useWallet();
  const filterSending = walletAccounts.map((item) => item.address);
  const supportedNetworks = useAddressSupportedNetworks(receipt);
  const [network, setNetwork] = useInputNetwork(
    defaultNetwork,
    supportedNetworks?.map((item) => item.key),
  );

  return (
    <NetworkProvider network={network}>
      <FundContent
        defaultValue={defaultValue}
        onClose={onClose}
        open={open}
        receipt={receipt}
        filterSending={filterSending}
        network={network}
        supportedNetworks={supportedNetworks?.map((item) => item.key)}
        setNetwork={setNetwork}
      />
    </NetworkProvider>
  );
}

export default React.memo(Fund);
