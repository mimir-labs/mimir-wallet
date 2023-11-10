// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Transaction } from '@mimirdev/hooks/types';

import { alpha, Box, Paper } from '@mui/material';
import React, { useMemo } from 'react';

import { AddressCell } from '@mimirdev/components';
import { useAddressMeta } from '@mimirdev/hooks';

import { extraTransaction } from '../util';

function TxProcess({ tx }: { tx: Transaction }) {
  const { meta } = useAddressMeta(tx.sender);

  const process = useMemo(() => extraTransaction(meta, tx)[0] / (meta.threshold || 1), [meta, tx]);

  return (
    <Paper sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, padding: 0.5, width: '100%', bgcolor: 'secondary.main' }} variant='elevation'>
      <AddressCell shorten size='small' value={tx.sender} />
      {meta.isMultisig && (
        <Box sx={({ palette }) => ({ overflow: 'hidden', borderRadius: '1px', position: 'relative', marginX: 3.5, height: '2px', bgcolor: alpha(palette.primary.main, 0.1) })}>
          <Box sx={{ borderRadius: '1px', position: 'absolute', left: 0, top: 0, bottom: 0, bgcolor: 'primary.main', width: `${process * 100}%` }} />
        </Box>
      )}
    </Paper>
  );
}

export default React.memo(TxProcess);
