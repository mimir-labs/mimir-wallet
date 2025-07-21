// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { type AccountData, type Transaction, TransactionStatus } from '@/hooks/types';
import React from 'react';

import { useApi } from '@mimir-wallet/polkadot-core';
import { Modal, ModalBody, ModalContent, ModalHeader } from '@mimir-wallet/ui';

import HistoryTxOverview from './HistoryTxOverview';
import PendingTxOverview from './PendingTxOverview';

interface Props {
  account: AccountData;
  transaction: Transaction;
  open: boolean;
  showButton?: boolean;
  onClose: () => void;
}

function TxOverviewDialog({ account, showButton, transaction, onClose, open }: Props) {
  const { api } = useApi();

  return (
    <Modal size='5xl' onClose={onClose} isOpen={open}>
      <ModalContent>
        <ModalHeader>Progress Overview</ModalHeader>
        <ModalBody className='pb-5'>
          <div className='rounded-medium border-divider-300 h-[50dvh] flex-auto border-1'>
            {open && transaction.status < TransactionStatus.Success ? (
              <PendingTxOverview
                api={api}
                showButton={showButton}
                account={account}
                call={transaction.call}
                transaction={transaction}
                onApprove={onClose}
              />
            ) : (
              <HistoryTxOverview transaction={transaction} />
            )}
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

export default React.memo(TxOverviewDialog);
