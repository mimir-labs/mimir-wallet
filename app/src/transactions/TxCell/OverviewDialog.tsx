// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { HistoryTxOverview, TxOverview } from '@/components';
import { type AccountData, type Transaction, TransactionStatus } from '@/hooks/types';
import React from 'react';

import { useApi } from '@mimir-wallet/polkadot-core';
import { Modal, ModalBody, ModalContent, ModalHeader } from '@mimir-wallet/ui';

interface Props {
  account: AccountData;
  transaction: Transaction;
  open: boolean;
  onClose: () => void;
}

function OverviewDialog({ account, transaction, onClose, open }: Props) {
  const { api } = useApi();

  return (
    <Modal size='5xl' onClose={onClose} isOpen={open}>
      <ModalContent>
        <ModalHeader>Progress Overview</ModalHeader>
        <ModalBody className='pb-5'>
          <div className='rounded-medium border-divider-300 h-[50dvh] flex-auto border-1'>
            {open && transaction.status < TransactionStatus.Success ? (
              <TxOverview
                api={api}
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

export default React.memo(OverviewDialog);
