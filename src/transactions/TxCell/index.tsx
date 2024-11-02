// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountData, Transaction } from '@mimir-wallet/hooks/types';

import { Box, Divider, Paper, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import moment from 'moment';
import React from 'react';

import { TransactionStatus } from '@mimir-wallet/hooks/types';

import { formatTransactionId } from '../utils';
import TxItems from './TxItems';
import TxItemsSmall from './TxItemsSmall';

interface Props {
  withDetails?: boolean;
  defaultOpen?: boolean;
  account: AccountData;
  transaction: Transaction;
}

function TxCell({ withDetails, defaultOpen, account, transaction }: Props) {
  const { status } = transaction;
  const { breakpoints } = useTheme();
  const downSm = useMediaQuery(breakpoints.down('sm'));

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
            No {formatTransactionId(transaction.id)}
          </Typography>
        </Stack>
        <Typography>
          {transaction.status < TransactionStatus.Success
            ? moment(transaction.createdAt).format()
            : moment(transaction.updatedAt).format()}
        </Typography>
      </Box>
      <Divider orientation='horizontal' />
      {downSm ? (
        <TxItemsSmall transaction={transaction} />
      ) : (
        <TxItems withDetails={withDetails} defaultOpen={defaultOpen} account={account} transaction={transaction} />
      )}
    </Paper>
  );
}

export default React.memo(TxCell);
