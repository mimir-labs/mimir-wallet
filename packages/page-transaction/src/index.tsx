// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Button, Paper, Stack } from '@mui/material';
import { useState } from 'react';

import MultisigCell from './MultisigCell';
import { useMultisigs } from './useMultisigs';

function PageTransaction() {
  const multisigs = useMultisigs();
  const [type, setType] = useState<'pending' | 'history'>('pending');

  return (
    <Box>
      <Paper sx={{ borderRadius: '20px', padding: 1.25, display: 'inline-flex', marginBottom: 2.5 }}>
        <Button onClick={() => setType('pending')} sx={{ paddingX: 3 }} variant={type === 'pending' ? 'contained' : 'text'}>
          Pending
        </Button>
        <Button color='primary' onClick={() => setType('history')} sx={{ paddingX: 3 }} variant={type === 'history' ? 'contained' : 'text'}>
          History
        </Button>
      </Paper>
      <Stack spacing={2.5}>
        {multisigs?.map((multisig, index) => (
          <MultisigCell key={index} multisig={multisig} />
        ))}
      </Stack>
    </Box>
  );
}

export default PageTransaction;
