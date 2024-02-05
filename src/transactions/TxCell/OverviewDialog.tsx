// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Filtered } from '@mimir-wallet/hooks/ctx/types';

import { TxOverview } from '@mimir-wallet/components';
import { CalldataStatus, type Transaction } from '@mimir-wallet/hooks/types';
import { Dialog, DialogContent, DialogTitle } from '@mui/material';
import React from 'react';

interface Props {
  tx: Transaction;
  approveFiltered?: Filtered;
  cancelFiltered?: Filtered;
  open: boolean;
  onClose: () => void;
}

function OverviewDialog({ approveFiltered, cancelFiltered, onClose, open, tx }: Props) {
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
        {open && (
          <TxOverview approveFiltered={tx.status < CalldataStatus.Success ? approveFiltered : undefined} cancelFiltered={tx.status < CalldataStatus.Success ? cancelFiltered : undefined} tx={tx} />
        )}
      </DialogContent>
    </Dialog>
  );
}

export default React.memo(OverviewDialog);
