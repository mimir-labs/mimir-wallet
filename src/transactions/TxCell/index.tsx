// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountData, Transaction } from '@mimir-wallet/hooks/types';

import {
  Box,
  Divider,
  IconButton,
  Paper,
  Stack,
  SvgIcon,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import moment from 'moment';
import React from 'react';

import { encodeAddress } from '@mimir-wallet/api';
import IconShare from '@mimir-wallet/assets/svg/icon-share.svg?react';
import { TransactionStatus } from '@mimir-wallet/hooks/types';
import { useApi } from '@mimir-wallet/hooks/useApi';
import { useCopyClipboard } from '@mimir-wallet/hooks/useCopyClipboard';

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
  const [isCopied, copy] = useCopyClipboard();
  const { network } = useApi();

  return (
    <Paper component={Stack} spacing={1.2} sx={{ padding: { sm: 1.5, xs: 1.2 }, borderRadius: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
        <Stack alignItems='center' direction='row' spacing={1.25} flexGrow={1}>
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

        <Tooltip title={isCopied ? 'Copied' : 'Copy the transaction URL'}>
          <IconButton
            color='primary'
            size='small'
            onClick={() => {
              const url = new URL(window.location.href);

              url.searchParams.set('tx_id', transaction.id.toString());

              copy(
                `${window.location.origin}/transactions/${transaction.id}?network=${network}&address=${encodeAddress(transaction.address)}`
              );
            }}
          >
            <SvgIcon component={IconShare} />
          </IconButton>
        </Tooltip>
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
