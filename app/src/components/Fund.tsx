// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AssetInfo } from '@/hooks/types';

import TransferAction from '@/apps/transfer/TransferAction';
import TransferContent from '@/apps/transfer/TransferContent';
import { useAddressSupportedNetworks } from '@/hooks/useAddressSupportedNetwork';
import { useInputNetwork } from '@/hooks/useInputNetwork';
import { useInputNumber } from '@/hooks/useInputNumber';
import { useWallet } from '@/wallet/useWallet';
import React, { useEffect, useState } from 'react';
import { useToggle } from 'react-use';

import { SubApiRoot, useNetworks } from '@mimir-wallet/polkadot-core';
import { Alert, Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Spinner } from '@mimir-wallet/ui';

interface Props {
  defaultNetwork?: string;
  open: boolean;
  defaultValue?: string | { toString: () => string };
  receipt?: string;
  onClose: () => void;
}

function Fund({ defaultValue, defaultNetwork, onClose, open, receipt }: Props) {
  const { enableNetwork } = useNetworks();
  const { walletAccounts } = useWallet();
  const filterSending = walletAccounts.map((item) => item.address);

  const [sending, setSending] = useState<string>(filterSending.at(0) || '');
  const supportedNetworks = useAddressSupportedNetworks(receipt);
  const [network, setNetwork] = useInputNetwork(
    defaultNetwork,
    supportedNetworks?.map((item) => item.key)
  );
  const [keepAlive, toggleKeepAlive] = useToggle(true);
  const [[amount, isAmountValid], setAmount] = useInputNumber(defaultValue?.toString() || '', false, 0);
  const [token, setToken] = useState<AssetInfo<boolean>>();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) enableNetwork(network);

    if (!open) {
      // reset
      setError(null);
      setAmount('');
      setToken(undefined);
      toggleKeepAlive(true);
    }
  }, [enableNetwork, network, open, setAmount, toggleKeepAlive]);

  return (
    <SubApiRoot
      network={network}
      supportedNetworks={supportedNetworks?.map((item) => item.key)}
      Fallback={
        open
          ? ({ apiState: { chain } }) => (
              <Modal size='lg' onClose={onClose} isOpen={open}>
                <ModalContent>
                  <ModalBody>
                    <Spinner size='lg' variant='wave' label={`Connecting to the ${chain.name}...`} />
                  </ModalBody>
                </ModalContent>
              </Modal>
            )
          : undefined
      }
    >
      <Modal size='lg' onClose={onClose} isOpen={open}>
        <ModalContent>
          <ModalHeader>Fund</ModalHeader>

          <ModalBody className='flex flex-col gap-5'>
            {receipt && (
              <TransferContent
                disabledRecipient
                filterSending={filterSending}
                amount={amount}
                isAmountValid={isAmountValid}
                keepAlive={keepAlive}
                token={token}
                sending={sending}
                recipient={receipt}
                network={network}
                setSending={setSending}
                setNetwork={setNetwork}
                setAmount={setAmount}
                toggleKeepAlive={toggleKeepAlive}
                setToken={setToken}
              />
            )}

            {error && <Alert color='danger'>{error}</Alert>}
          </ModalBody>

          <ModalFooter>
            <Button fullWidth onPress={onClose} variant='ghost'>
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
          </ModalFooter>
        </ModalContent>
      </Modal>
    </SubApiRoot>
  );
}

export default React.memo(Fund);
