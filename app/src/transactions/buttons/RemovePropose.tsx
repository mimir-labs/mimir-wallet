// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountData, ProposeTransaction, Transaction } from '@/hooks/types';

import { InputAddress } from '@/components';
import { toastError } from '@/components/utils';
import { walletConfig } from '@/config';
import { CONNECT_ORIGIN } from '@/constants';
import { events } from '@/events';
import { TransactionType } from '@/hooks/types';
import { useProposeFilterForRemove } from '@/hooks/useProposeFilter';
import { accountSource } from '@/wallet/useWallet';
import React, { useState } from 'react';
import { useToggle } from 'react-use';

import { useApi } from '@mimir-wallet/polkadot-core';
import { service } from '@mimir-wallet/service';
import { Alert, Button, Divider, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@mimir-wallet/ui';

function Content({
  filtered,
  transaction,
  onRemove
}: {
  filtered: string[];
  transaction: ProposeTransaction;
  onRemove: () => void;
}) {
  const { genesisHash, network } = useApi();
  const [signer, setSigner] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!signer) {
      toastError('Please select a valid signer address');

      return;
    }

    const source = accountSource(signer);

    if (!source) {
      toastError('Please select a valid signer address');

      return;
    }

    const injected = await window.injectedWeb3?.[walletConfig[source]?.key || ''].enable(CONNECT_ORIGIN);
    const injectSigner = injected?.signer;

    if (!injectSigner) {
      toastError(`Please connect to the wallet: ${walletConfig[source]?.name || source}`);

      return;
    }

    if (!injectSigner.signRaw) {
      toastError(`Wallet ${walletConfig[source]?.name || source} does not support signRaw`);

      return;
    }

    setLoading(true);

    try {
      const time = new Date().toUTCString();
      const message = `Remove Propose:
Propose ID: ${transaction.id}
Time: ${time}
Genesis Hash: ${genesisHash}`;

      const result = await injectSigner.signRaw({
        address: signer,
        data: message,
        type: 'bytes'
      });

      await service.transaction.removePropose(network, transaction.id, signer, result.signature, time);
      onRemove();
      events.emit('refetch_pending_tx');
    } catch (error) {
      toastError(error);
    }

    setLoading(false);
  };

  return (
    <>
      <ModalBody className='space-y-5'>
        <Alert
          color='primary'
          title={`Please select the signer address to remove the propose with id ${transaction.id}.`}
        />
        <InputAddress
          label='Select signer'
          placeholder='Please select signer address. e.g.5G789...'
          isSign
          filtered={filtered}
          value={signer}
          onChange={setSigner}
        />
      </ModalBody>
      <Divider />
      <ModalFooter>
        <Button fullWidth isLoading={loading} isDisabled={!signer} onPress={handleConfirm}>
          Confirm
        </Button>
      </ModalFooter>
    </>
  );
}

function RemovePropose({ account, transaction }: { account: AccountData; transaction: Transaction }) {
  const [isOpen, toggleOpen] = useToggle(false);
  const filtered = useProposeFilterForRemove(account, transaction);

  if (transaction.type !== TransactionType.Propose || filtered.length === 0) {
    return null;
  }

  return (
    <>
      <Button fullWidth variant='ghost' color='danger' onClick={toggleOpen}>
        Remove Propose
      </Button>

      <Modal isOpen={isOpen} onClose={toggleOpen}>
        <ModalContent>
          <ModalHeader>Remove Propose {transaction.id}</ModalHeader>
          <Divider />
          <Content filtered={filtered} transaction={transaction} onRemove={toggleOpen} />
        </ModalContent>
      </Modal>
    </>
  );
}

export default React.memo<typeof RemovePropose>(RemovePropose);
