// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Transaction } from '@/hooks/types';

import { AppName } from '@/components';
import { TransactionStatus } from '@/hooks/types';
import { CallDisplaySection } from '@/params';
import { formatTransactionId, Status } from '@/transactions';
import { Box, Divider, Paper, Stack, Typography } from '@mui/material';
import moment from 'moment';
import React from 'react';

function Summary({ transaction }: { transaction: Transaction }) {
  return (
    <Paper component={Stack} spacing={1} sx={{ padding: 1.5, borderRadius: 2 }}>
      <Typography>
        {transaction.status < TransactionStatus.Success
          ? moment(transaction.createdAt).format()
          : moment(transaction.updatedAt).format()}
      </Typography>

      <Divider />

      <Typography color='primary' variant='h4'>
        {formatTransactionId(transaction.id)}
      </Typography>

      <Divider />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 3 }}>
        <AppName website={transaction.website} appName={transaction.appName} iconUrl={transaction.iconUrl} />
        <Status transaction={transaction} />
        <CallDisplaySection section={transaction.section} method={transaction.method} />
      </Box>
    </Paper>
  );
}

export default React.memo(Summary);
