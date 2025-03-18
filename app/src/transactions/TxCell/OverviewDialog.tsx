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
        <ModalBody className='flex-auto h-[50dvh] bg-secondary border-medium'>
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
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

export default React.memo(OverviewDialog);
