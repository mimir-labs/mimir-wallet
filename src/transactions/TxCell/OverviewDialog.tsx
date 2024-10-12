// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Dialog, DialogContent, DialogTitle } from '@mui/material';
import { IMethod } from '@polkadot/types/types';
import { HexString } from '@polkadot/util/types';
import React from 'react';

import { HistoryTxOverview, TxOverview } from '@mimir-wallet/components';
import { useApi, useTxQueue } from '@mimir-wallet/hooks';
import { type AccountData, FilterPath, type Transaction, TransactionStatus } from '@mimir-wallet/hooks/types';

interface Props {
  account: AccountData;
  transaction: Transaction;
  open: boolean;
  onClose: () => void;
}

function OverviewDialog({ account, transaction, onClose, open }: Props) {
  const { api } = useApi();
  const { addQueue } = useTxQueue();

  const onApprove = (call: IMethod | HexString, filterPaths: FilterPath[]) => {
    addQueue({
      accountId: transaction.address,
      call: api.createType('Call', call),
      filterPaths,
      transaction
    });
    onClose();
  };

  return (
    <Dialog fullWidth maxWidth='lg' onClose={onClose} open={open}>
      <DialogTitle>Progress Overview</DialogTitle>
      <DialogContent
        sx={{
          height: '50vh',
          bgcolor: 'secondary.main',
          borderRadius: 1
        }}
      >
        {open && transaction.status < TransactionStatus.Success ? (
          <TxOverview account={account} call={transaction.call} transaction={transaction} onApprove={onApprove} />
        ) : (
          <HistoryTxOverview transaction={transaction} />
        )}
      </DialogContent>
    </Dialog>
  );
}

export default React.memo(OverviewDialog);
