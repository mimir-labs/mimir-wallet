// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { HistoryTxOverview, TxOverview } from '@/components';
import { type AccountData, type Transaction, TransactionStatus } from '@/hooks/types';
import { useApi } from '@/hooks/useApi';
import { Dialog, DialogContent, DialogTitle } from '@mui/material';
import React from 'react';

interface Props {
  account: AccountData;
  transaction: Transaction;
  open: boolean;
  onClose: () => void;
}

function OverviewDialog({ account, transaction, onClose, open }: Props) {
  const { api } = useApi();

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
      </DialogContent>
    </Dialog>
  );
}

export default React.memo(OverviewDialog);
