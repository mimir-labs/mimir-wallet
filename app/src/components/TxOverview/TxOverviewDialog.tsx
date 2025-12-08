// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useNetwork } from '@mimir-wallet/polkadot-core';
import { Modal, ModalBody, ModalContent, ModalHeader } from '@mimir-wallet/ui';
import React from 'react';

import HistoryTxOverview from './HistoryTxOverview';
import PendingTxOverview from './PendingTxOverview';

import {
  type AccountData,
  type Transaction,
  TransactionStatus,
} from '@/hooks/types';

interface Props {
  account: AccountData;
  transaction: Transaction;
  open: boolean;
  showButton?: boolean;
  onClose: () => void;
}

function TxOverviewDialog({
  account,
  showButton,
  transaction,
  onClose,
  open,
}: Props) {
  const { network } = useNetwork();

  return (
    <Modal size="5xl" onClose={onClose} isOpen={open}>
      <ModalContent>
        <ModalHeader>Progress Overview</ModalHeader>
        <ModalBody className="pb-5">
          <div className="border-divider h-[50dvh] flex-auto rounded-[10px] border-1">
            {open && transaction.status < TransactionStatus.Success ? (
              <PendingTxOverview
                network={network}
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
