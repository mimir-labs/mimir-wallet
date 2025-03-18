// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountData, Transaction } from '@/hooks/types';

import { Input, TxButton } from '@/components';
import { toastError } from '@/components/utils';
import { TransactionType } from '@/hooks/types';
import { useTxQueue } from '@/hooks/useTxQueue';
import { useWallet } from '@/wallet/useWallet';
import React, { useState } from 'react';
import { useToggle } from 'react-use';

import { addressEq, useApi } from '@mimir-wallet/polkadot-core';
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@mimir-wallet/ui';

import { useAnnouncementStatus } from '../hooks/useAnnouncementStatus';

function ExecuteAnnounce({ account, transaction }: { account: AccountData; transaction: Transaction }) {
  const { api } = useApi();
  const { addQueue } = useTxQueue();
  const { walletAccounts } = useWallet();
  const [status] = useAnnouncementStatus(transaction, account);
  const [loading, setLoading] = useState(false);
  const [isOpen, toggleOpen] = useToggle(false);
  const [calldata, setCalldata] = useState('');

  if (walletAccounts.length === 0) {
    return null;
  }

  if (transaction.type !== TransactionType.Announce) {
    return null;
  }

  const delegate = transaction.delegate;

  if (!delegate) {
    return null;
  }

  if (status !== 'executable') {
    return null;
  }

  const handleExecute = async () => {
    setLoading(true);

    try {
      let call: string;

      if (transaction.call) {
        call = transaction.call;
      } else {
        if (api.createType('Call', calldata).hash.toHex() !== transaction.callHash) {
          throw new Error('Invalid calldata');
        }

        call = calldata;
      }

      const proxies = await api.query.proxy.proxies(transaction.address);

      const proxyDefine = proxies[0].find((item) => addressEq(item.delegate, delegate));

      if (!proxyDefine) {
        toastError(`can not find delegate(${delegate})`);
      } else {
        addQueue({
          call: api.tx.proxy.proxyAnnounced(delegate, transaction.address, proxyDefine.proxyType, call),
          website: 'mimir://internal/execute-announcement'
        });
      }
    } catch (error) {
      toastError(error);
    }

    toggleOpen(false);
    setLoading(false);
  };

  return (
    <>
      <TxButton
        fullWidth
        variant='solid'
        color='primary'
        overrideAction={transaction.call ? handleExecute : toggleOpen}
        isLoading={loading}
      >
        Execute
      </TxButton>

      <Modal size='2xl' onClose={toggleOpen} isOpen={isOpen}>
        <ModalContent>
          <ModalHeader>Call Data</ModalHeader>
          <ModalBody>
            <div className='space-y-4'>
              <p>Fill Call Data to execute this transaction.</p>
              <Input value={calldata} onChange={setCalldata} />
            </div>
          </ModalBody>
          <ModalFooter>
            <TxButton fullWidth variant='solid' color='primary' overrideAction={handleExecute}>
              Execute
            </TxButton>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

export default React.memo<typeof ExecuteAnnounce>(ExecuteAnnounce);
