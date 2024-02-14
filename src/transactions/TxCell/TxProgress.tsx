// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Transaction } from '@mimir-wallet/hooks/types';

import { AddressCell, toastSuccess } from '@mimir-wallet/components';
import { useAddressMeta, useCopyClipboard } from '@mimir-wallet/hooks';
import { alpha, Box, Paper } from '@mui/material';
import React, { useCallback, useMemo } from 'react';

import { extraTransaction } from '../util';

function TxProgress({ tx }: { tx: Transaction }) {
  const { meta } = useAddressMeta(tx.sender);
  const [, copy] = useCopyClipboard();

  const progress = useMemo(() => extraTransaction(meta, tx)[0] / (meta.threshold || 1), [meta, tx]);

  const handleClick = useCallback(() => {
    copy(tx.sender);
    toastSuccess('Copied');
  }, [copy, tx.sender]);

  return (
    <Paper onClick={handleClick} sx={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 0.5, padding: 0.5, width: '100%', bgcolor: 'secondary.main' }} variant='elevation'>
      <AddressCell shorten size='small' value={tx.sender} />
      {meta.isMultisig && (
        <Box sx={({ palette }) => ({ overflow: 'hidden', borderRadius: '1px', position: 'relative', marginX: 3.5, height: '2px', bgcolor: alpha(palette.primary.main, 0.1) })}>
          <Box sx={{ borderRadius: '1px', position: 'absolute', left: 0, top: 0, bottom: 0, bgcolor: 'primary.main', width: `${progress * 100}%` }} />
        </Box>
      )}
    </Paper>
  );
}

export default React.memo(TxProgress);
