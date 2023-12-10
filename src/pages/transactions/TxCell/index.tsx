// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Transaction } from '@mimirdev/hooks/types';

import { Paper } from '@mui/material';
import React from 'react';

import { useToggle } from '@mimirdev/hooks';

import { useRelatedTxs } from '../useRelatedTxs';
import Extrinsic from './Extrinsic';
import Process from './Process';

function TxCell({ defaultOpen, transaction }: { defaultOpen?: boolean; transaction: Transaction }) {
  const [detailOpen, toggleDetailOpen] = useToggle(defaultOpen);
  const [processOpen, toggleProcessOpen] = useToggle(defaultOpen);
  const [relatedTxs, cancelTx] = useRelatedTxs(transaction);

  return (
    <Paper sx={{ display: 'flex', padding: 2, gap: 2, borderRadius: 2 }}>
      <Extrinsic detailOpen={detailOpen} relatedTxs={relatedTxs} toggleDetailOpen={toggleDetailOpen} transaction={transaction} />
      <Process cancelTx={cancelTx} processOpen={processOpen} toggleProcessOpen={toggleProcessOpen} transaction={transaction} />
    </Paper>
  );
}

export default React.memo(TxCell);
