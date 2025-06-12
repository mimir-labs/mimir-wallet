// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import IconInfo from '@/assets/svg/icon-info-fill.svg?react';
import { Hash, Input } from '@/components';
import { toastError } from '@/components/utils';
import { type AccountData, type FilterPath, type Transaction, TransactionType } from '@/hooks/types';
import { useTxQueue } from '@/hooks/useTxQueue';
import { blake2AsHex } from '@polkadot/util-crypto';
import React, { useMemo, useState } from 'react';
import { useToggle } from 'react-use';

import { useApi } from '@mimir-wallet/polkadot-core';
import { Button, Divider, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@mimir-wallet/ui';

function Approve({
  account,
  transaction,
  filterPaths
}: {
  account: AccountData;
  transaction: Transaction;
  filterPaths: FilterPath[][];
}) {
  const { api, network } = useApi();
  const [isOpen, toggleOpen] = useToggle(false);
  const [calldata, setCalldata] = useState('');
  const { addQueue } = useTxQueue();

  const error = useMemo(() => {
    if (!calldata) {
      return null;
    }

    try {
      const call = api.createType('Call', calldata);

      if (
        (transaction.type === TransactionType.Multisig ? blake2AsHex(call.toU8a()) : call.hash.toHex()) !==
        transaction.callHash
      ) {
        return new Error('Call hash mismatch');
      }

      return null;
    } catch {
      return new Error('Invalid call data');
    }
  }, [api, calldata, transaction.callHash, transaction.type]);

  if (
    (transaction.type !== TransactionType.Multisig &&
      transaction.type !== TransactionType.Proxy &&
      transaction.type !== TransactionType.Propose) ||
    !filterPaths.length
  ) {
    return null;
  }

  const handleApprove = () => {
    if (transaction.call) {
      addQueue({
        accountId: account.address,
        transaction,
        call: transaction.call,
        network
      });
    } else {
      toggleOpen(true);
    }
  };

  const handleRecover = () => {
    if (!calldata) {
      return;
    }

    const call = api.createType('Call', calldata);

    if (
      (transaction.type === TransactionType.Multisig ? blake2AsHex(call.toU8a()) : call.hash.toHex()) !==
      transaction.callHash
    ) {
      toastError('Invalid call data');

      return;
    }

    addQueue({
      accountId: account.address,
      transaction,
      call,
      network
    });

    toggleOpen(false);
  };

  return (
    <>
      <Button fullWidth variant='solid' color='primary' onPress={handleApprove}>
        Approve
      </Button>

      <Modal size='2xl' onClose={toggleOpen} isOpen={isOpen}>
        <ModalContent>
          <ModalHeader>Call Data</ModalHeader>
          <ModalBody className='gap-y-2.5'>
            <p className='text-foreground/50 text-tiny leading-[16px]'>
              <IconInfo className='w-4 h-4 mr-1 inline align-text-bottom' />
              This transaction wasn’t initiated from Mimir. But you can copy Call Data from explorer to recover this
              transaction
            </p>
            <Divider />
            <div className='grid grid-cols-[60px_1fr] gap-y-2.5 gap-x-1.5 items-center'>
              <b>Call Data</b>
              <Input value={calldata} onChange={setCalldata} error={error} />
              <b>Call Hash</b>
              <p>
                <Hash value={transaction.callHash} />
              </p>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button fullWidth variant='ghost' color='primary' isDisabled={!calldata} onPress={handleRecover}>
              Recover
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

export default React.memo<typeof Approve>(Approve);
