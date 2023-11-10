// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Transaction } from '@mimirdev/hooks/types';

import { Paper } from '@mui/material';
import React from 'react';

import Extrinsic from './Extrinsic';
import Process from './Process';

function TxCell({ transaction }: { transaction: Transaction }) {
  return (
    <Paper sx={{ display: 'flex', padding: 2, gap: 2, borderRadius: 2 }}>
      <Extrinsic transaction={transaction} />
      <Process transaction={transaction} />
    </Paper>
  );
}

export default React.memo(TxCell);
