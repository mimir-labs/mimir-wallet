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
import React, { useEffect, useRef, useState } from 'react';

import NetworkErrorAlert from './NetworkErrorAlert';

import TransferAction from '@/apps/transfer/TransferAction';
import TransferContent from '@/apps/transfer/TransferContent';
import {
  InputTokenAmountProvider,
  useInputTokenAmountContext,
} from '@/components/InputTokenAmount';
import { useWallet } from '@/wallet/useWallet';

interface Props {
  defaultNetwork?: string;
  open: boolean;
  defaultValue?: string | { toString: () => string };
  receipt?: string;
  onClose: () => void;
}

// Inner content component that uses context
function FundModalContent({
  defaultValue,
  onClose,
  open,
  receipt,
  filterSending,
  sending,
  setSending,
}: {
  defaultValue?: string | { toString: () => string };
  sending: string;
  setSending: (value: string) => void;
  onClose: () => void;
  open: boolean;
  receipt?: string;
  filterSending: string[];
}) {
  const [error, setError] = useState<string | null>(null);
  const prevOpenRef = useRef(open);

  const { network, token, amount, isAmountValid, keepAlive, setAmount, reset } =
    useInputTokenAmountContext();

  // Set default amount when dialog opens with defaultValue
  useEffect(() => {
    if (open && defaultValue) {
      setAmount(defaultValue.toString());
    }
  }, [open, defaultValue, setAmount]);

  useEffect(() => {
    // Reset form when dialog closes (transition from true to false)
    if (prevOpenRef.current && !open) {
      queueMicrotask(() => {
        setError(null);
        reset();
      });
    }

    prevOpenRef.current = open;
  }, [open, reset]);

  return (
    <NetworkProvider network={network}>
      <Modal size="lg" onClose={onClose} isOpen={open}>
        <ModalContent>
          <ModalHeader>Fund</ModalHeader>

          <ModalBody className="flex flex-col gap-5">
            {receipt && (
              <TransferContent
                disabledRecipient
                filterSending={filterSending}
                sending={sending}
                recipient={receipt}
                setSending={setSending}
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
                  token={token?.token}
                  amount={amount}
                  isAmountValid={isAmountValid}
                  keepAlive={keepAlive}
                  sending={sending}
                  recipient={receipt}
                  onDone={() => {
                    setError(null);
                    onClose();
                  }}
                  onError={(error: unknown) => {
                    const message =
                      error instanceof Error
                        ? error.message
                        : 'Something went wrong';

                    setError(message);
                  }}
                >
                  Submit
                </TransferAction>
              )}
            </div>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </NetworkProvider>
  );
}

function Fund({ defaultValue, defaultNetwork, onClose, open, receipt }: Props) {
  const { walletAccounts } = useWallet();
  const filterSending = walletAccounts.map((item) => item.address);
  const [sending, setSending] = useState<string>(filterSending.at(0) || '');

  return (
    <InputTokenAmountProvider
      address={sending}
      defaultNetwork={defaultNetwork}
      defaultIdentifier="native"
    >
      <FundModalContent
        defaultValue={defaultValue}
        onClose={onClose}
        sending={sending}
        setSending={setSending}
        open={open}
        receipt={receipt}
        filterSending={filterSending}
      />
    </InputTokenAmountProvider>
  );
}

export default React.memo(Fund);
