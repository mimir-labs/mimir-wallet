// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountData, Transaction } from '@/hooks/types';

import { encodeAddress } from '@/api';
import IconShare from '@/assets/svg/icon-share.svg?react';
import { TransactionStatus, TransactionType } from '@/hooks/types';
import { useApi } from '@/hooks/useApi';
import { useCopyClipboard } from '@/hooks/useCopyClipboard';
import { Box, Divider, Paper, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import moment from 'moment';
import React from 'react';

import { Button, Tooltip } from '@mimir-wallet/ui';

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
          {transaction.type === TransactionType.Propose ? (
            <h4 className='text-primary'>Propose {transaction.id}</h4>
          ) : (
            <h4 className='text-primary'>No {formatTransactionId(transaction.id)}</h4>
          )}
        </Stack>

        <Typography>
          {transaction.status < TransactionStatus.Success
            ? moment(transaction.createdAt).format()
            : moment(transaction.updatedAt).format()}
        </Typography>

        <Tooltip content={isCopied ? 'Copied' : 'Copy the transaction URL'} closeDelay={0}>
          <Button
            isIconOnly
            color='primary'
            size='sm'
            variant='light'
            onPress={() => {
              const url = new URL(window.location.href);

              url.searchParams.set('tx_id', transaction.id.toString());

              copy(
                `${window.location.origin}/transactions/${transaction.id}?network=${network}&address=${encodeAddress(transaction.address)}`
              );
            }}
          >
            <IconShare className='w-4 h-4' />
          </Button>
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
