// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Filtered } from '@mimir-wallet/hooks/ctx/types';

import { useAddressMeta } from '@mimir-wallet/hooks';
import { type Transaction } from '@mimir-wallet/hooks/types';
import { Box, Button, Divider, Paper, Stack, Typography } from '@mui/material';
import React, { useMemo } from 'react';

import { extraTransaction } from '../util';
import Operate from './Operate';
import TxProgress from './TxProgress';

interface Props {
  transaction: Transaction;
  approveFiltered?: Filtered;
  canApprove: boolean;
  cancelFiltered?: Filtered;
  canCancel: boolean;
  openOverview: () => void;
}

function ProgressTitle() {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontWeight: 700 }}>
      <Typography sx={{ color: 'primary.main' }} variant='h6'>
        Progress
      </Typography>
    </Box>
  );
}

function ProgressInfo({ approvals, threshold }: { approvals: number; threshold: number }) {
  return (
    <Box sx={{ marginTop: 0.5, display: 'none', alignItems: 'center', gap: 0.5 }}>
      {Array.from({ length: threshold || 0 }).map((_, index) => (
        <Box
          key={index}
          sx={{
            bgcolor: 'primary.main',
            height: 6,
            borderRadius: '3px',
            flex: '1',
            opacity: index < approvals ? 1 : 0.1
          }}
        />
      ))}
    </Box>
  );
}

function Progress({ approveFiltered, canApprove, canCancel, cancelFiltered, openOverview, transaction }: Props) {
  const { meta } = useAddressMeta(transaction.sender);
  const [approvals, txs] = useMemo((): [number, Transaction[]] => extraTransaction(meta, transaction), [meta, transaction]);

  return (
    <Stack bgcolor='secondary.main' component={Paper} minWidth={280} padding={2} spacing={1} variant='elevation'>
      <ProgressTitle />
      <ProgressInfo approvals={approvals} threshold={meta.threshold || 0} />
      <Divider />
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
          <Typography sx={{ fontWeight: 700, flex: '1' }}>
            Confirmations{' '}
            <span style={{ opacity: 0.5 }}>
              ({approvals}/{meta.threshold})
            </span>
          </Typography>
          <Button onClick={openOverview} size='small' sx={{ alignSelf: 'start' }} variant='text'>
            Overview
          </Button>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'stretch', marginTop: 1, minHeight: 20 }}>
          <Box sx={{ flex: '1', paddingY: 0.5 }}>
            <Stack spacing={1}>
              {txs.map((tx, index) => (
                <TxProgress key={index} tx={tx} />
              ))}
            </Stack>
          </Box>
        </Box>
      </Box>
      <Operate approveFiltered={approveFiltered} canApprove={canApprove} canCancel={canCancel} cancelFiltered={cancelFiltered} transaction={transaction} />
    </Stack>
  );
}

export default React.memo(Progress);
