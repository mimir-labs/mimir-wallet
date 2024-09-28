// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountData, Transaction } from '@mimir-wallet/hooks/types';

import { Box, Divider, Paper, Stack, Typography } from '@mui/material';
import moment from 'moment';
import React from 'react';

import { TransactionStatus } from '@mimir-wallet/hooks/types';

import TxItems from './TxItems';

interface Props {
  defaultOpen?: boolean;
  account: AccountData;
  transaction: Transaction;
}

function TxCell({ defaultOpen, account, transaction }: Props) {
  const { status } = transaction;

  return (
    <Paper component={Stack} spacing={1.2} sx={{ padding: { sm: 1.5, xs: 1.2 }, borderRadius: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Stack alignItems='center' direction='row' spacing={1.25}>
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: 1,
              bgcolor:
                status < TransactionStatus.Success
                  ? 'warning.main'
                  : status === TransactionStatus.Success
                    ? 'success.main'
                    : 'error.main'
            }}
          />
          <Typography color='primary.main' fontWeight={700} variant='h4'>
            No {transaction.id}
          </Typography>
        </Stack>
        <Typography>{moment(transaction.createdAt).format()}</Typography>
      </Box>
      <Divider orientation='horizontal' />
      <TxItems defaultOpen={defaultOpen} account={account} transaction={transaction} />
    </Paper>
  );
}

export default React.memo(TxCell);
