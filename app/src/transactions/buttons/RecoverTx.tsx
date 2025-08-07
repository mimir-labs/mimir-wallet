// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import IconInfo from '@/assets/svg/icon-info-fill.svg?react';
import { Hash, Input } from '@/components';
import { type Transaction, TransactionType } from '@/hooks/types';
import { blake2AsHex } from '@polkadot/util-crypto';
import { useMemo, useState } from 'react';

import { useApi } from '@mimir-wallet/polkadot-core';
import { Button, Divider, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@mimir-wallet/ui';

function RecoverTx({
  transaction,
  isOpen,
  onClose,
  handleRecover
}: {
  transaction: Transaction;
  isOpen: boolean;
  onClose: () => void;
  handleRecover: (calldata: string) => void;
}) {
  const { api } = useApi();
  const [calldata, setCalldata] = useState('');

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

  return (
    <Modal size='2xl' onClose={onClose} isOpen={isOpen}>
      <ModalContent>
        <ModalHeader>Call Data</ModalHeader>
        <ModalBody>
          <p className='text-foreground/50 text-xs leading-[16px]'>
            <IconInfo className='mr-1 inline h-4 w-4 align-middle' />
            This transaction wasn’t initiated from Mimir. But you can copy Call Data from explorer to recover this
            transaction
          </p>
          <Divider />
          <div className='grid grid-cols-[60px_1fr] items-center gap-x-1.5 gap-y-2.5'>
            <b>Call Data</b>
            <Input value={calldata} onChange={setCalldata} error={error} />
            <b>Call Hash</b>
            <p>
              <Hash value={transaction.callHash} />
            </p>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            fullWidth
            variant='ghost'
            color='primary'
            disabled={!calldata}
            onClick={() => handleRecover(calldata)}
          >
            Recover
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default RecoverTx;
